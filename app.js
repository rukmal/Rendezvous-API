
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var client = require('twilio')('AC6bcdd4b4386163cef2fa8141b6330bf2', '3f5cedbfd376649646600b8548ed0014');

// Database stuff
var dbURL = 'mongodb://localhost';
mongoose.connect(dbURL);
var users = require('./models/user');
var userhold = require('./models/userhold');
var status = require('./models/status');

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

var router = express.Router();

router.get('/', function (req, res) {
	res.redirect('http://rukmal.github.io/Rendezvous-API/');
});

router.route('/user/new/')
	.post(function (req, res) {
		console.log(req.body);
		expectedHeaders = ['firstname', 'lastname', 'username', 'picture', 'phone'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		// CHECK API KEY HERE
		// Saving the new information in the migration database
		var newUser = new userhold({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			password: req.body.password,
			phone: Number(req.body.phone),
			picture: req.body.picture,
			username: req.body.username.toLowerCase(),
			authCode: generateCode(),
		});
		if (req.body.facebook_id) {
			newUser.facebook_id = req.body.facebook_id;
		} else {
			newUser.facebook_id = newUser.username.toLowerCase();
		}
		console.log(newUser);
		// saving the user to the database
		newUser.save(function (err) {
			console.log('ERR: Error saving the new user ' + err);
			if (err) {
				res.send(makeStatusObject(409));
			} else {
				var body = 'Welcome to Rendezvous! Your verification code is ' + newUser.authCode + '.';
				sendText(newUser.phone, body);
				res.send(makeStatusObject(200));
			}
		});
	})
	// Moving user info from the temporary database to the actual one
	.put(function (req, res) {
		expectedHeaders = ['username', 'code'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		// CHECK API KEY HEREf
		userhold.findOne({ username: req.body.username.toLowerCase() }, function (err, tempUser) {
			if (err) console.log('ERR: Error searching for user ' + err);
			// Comparing auth codes
			if (tempUser) {
				if (tempUser.authCode === Number(req.body.code)) {
					delete tempUser.authCode;
					// Moving the user from one database to the other
					var permanentUser = new users(tempUser);
					permanentUser.save(function (error) {
						console.log('ERR: Error saving the user permanently ' + error);
						if (error) {
							res.send(makeStatusObject(409));
						} else {
							permanentUser.friends = getFriends(permanentUser.friends, res);
							res.send(permanentUser);
						}
					});
				} else {
					delete req.body;
					res.send(makeStatusObject(401));
				}
			} else {
				res.send(makeStatusObject(204));
			}
		});
	})

	.delete(function (req, res) {

	});

router.get('/user/picture/:username', function (req, res) {
	if (!req.params.username) {
		res.send(makeStatusObject(400));
	}
	var output = {};
	users.findOne({ username: req.params.username }, function (err, user) {
		if (err) console.log('ERR: Error searching for user ' + err);
		if (user) {
			output.username = user.username;
			output.picture = user.picture;
			res.send(output);
		} else {
			res.send(makeStatusObject(204));
		}
	});
});

router.get('/user/exists/:username', function (req, res) {
	if (req.params.username === null) {
		res.send(makeStatusObject(400));
	}
	var candidateUser = req.params.username.toLowerCase();
	userhold.find({ username: candidateUser }, function (err, useres) {
		if (err) console.log('ERR: Error searching for user based on username ' + err);
		var output = {};
		if (users > 0) {
			output['availability'] = false;
		} else {
			output['availability'] = true;
		}
		res.send(output);
	});
});

router.get('/user/exists/fb/:fbid', function (req, res) {
	if (req.params.fbid === null) {
		res.send(makeStatusObject(400));
	}
	// Searching the database
	users.findOne({ facebook_id: req.params.fbid }, function (err, user) {
		if (err) console.log('ERR: Error searching for user based on Facebook ID ' + err);
		if (user) {
			user.friends = getFriends(user.friends, res);
			res.send(user);
		} else {
			res.send(makeStatusObject(204));
		}
	});
});

router.route('/user/login')
	.post(function (req, res) {
		expectedHeaders = ['username', 'password'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		// CHECK API KEY HERE
		// Isolating request parameters
		var uname = req.body.username.toLowerCase();
		var password = req.body.password;
		// Searching database
		userhold.findOne({ 'username': uname }, function (err, user) {
			if (err) console.log('ERR: Error searching for user ' + err);
			if (user) {
				// Comparing passwords
				bcrypt.compare(password, user.password, function (err, result) {
					if (err) console.log('ERR: Error comparing passwords ' + err);
					if (result) {
						users.findOne({ 'username': uname }, function (err, permauser) {
							if (err) console.log('ERR: Error searching for permanenet user ' + err);
							permauser.friends = getFriends(permauser.friends, res);
							res.send(permauser);
						});
					} else {
						res.send(makeStatusObject(401));
					}
				});			
			} else {
				delete req.body;
				res.send(makeStatusObject(204));
			}
		});
	});

router.route('/user/find_friends')
	.post(function (req, res) {
		var expectedHeaders = ['number_list', 'username'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		var output = {};
		output.results = [];
		var numbers = req.body.number_list;
		users.findOne({ username: req.body.username }, function (err, user) {
			if (!user) {
				res.send(makeStatusObject(204));
			}
		});
		for (var number in numbers) {
			users.findOne({ phone: numbers[number] }, function (err, number){
				if (err) console.log('ERR: Error looking for user by phone number ' + err);
				if (err) {
					res.send(makeStatusObject(500));
				} else {
					delete user.password;
					delete user.friends;
					delete user.account_status;
					delete user.currentStatusID;
					delete user.pastStatuses;
					delete user.phone;
					output.results.push(user);
				}
			})
		}
		res.send(output);
	});

router.route('/user/login/encrypted')
	.post(function (req, res) {
		expectedHeaders = ['username', 'encrypted_password'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		// CHECK API KEY HERE
		// Isolating request parameters
		var candidateUser = req.body.username;
		var encrypted_password = req.body.encrypted_password;
		users.findOne({ username: candidateUser }, function (err, user) {
			if (err) console.log('ERR: Error searching for user ' + err);
			if (user) {
				if (user.password === encrypted_password) {
					user.friends = getFriends(user.friends, res);
					res.send(user);
				} else {
					res.send(makeStatusObject(401));
				}
			} else {
				delete req.body;
				res.send(makeStatusObject(204));
			}
		})
	});

router.route('/user/invite')
	.post(function (req, res) {
		var expectedHeaders = ['username', 'target_phone'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		users.findOne({ username: req.body.username }, function (err, user) {
			if (err) console.log('ERR: Error searching for user ' + err);
			if (!user) {
				res.send(makeStatusObject(204));
				return
			} else {
				sendText(req.body.target_phone, 'Your friend ' + user.firstname + ' ' + user.lastname + ' thought you should try Rendezvous. Get it at http://getrendezvous.co/!');
			}
		});
		res.send(makeStatusObject(200));
	});

router.route('/status/new')
	.post(function (req, res) {
		expectedHeaders = ['username', 'type', 'location_lat', 'location_lon'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(makeStatusObject(400));
		}
		// CHECK API KEY HERE
		// Checking to see if the request contains an offset
		var defaultOffset = 600000; // ms (equal to 10 minutes)
		var offset = 0;
		if (req.body.expiration_time) {
			offset = req.body.expiration_time;
		} else {
			offset = defaultOffset;
		}
		// ADD CHECKING BY USERNAME HERE
		// Creating new mognoose object
		var newStatus = new status({
			time: new Date(),
			type: req.body.type,
			location_lat: req.body.location_lat,
			location_lon: req.body.location_lon,
			expiration_time: new Date(new Date().getTime() + offset),
			created_by: req.body.username
		});
		newStatus.save(function (err) {
			if (err) console.log('ERR: Error saving the new status ' + err);
			if (err) {
				res.send(makeStatusObject(409));
			}
		});
		users.findOne({ username: req.body.username }, function (err, user) {
			if (err) console.log('ERR: Error looking up user ' + err);
			if (user.currentStatusID != null) {
				user.pastStatuses.push(user.currentStatusID);
			}
			user.currentStatusID = newStatus._id;
		});
		res.send(newStatus);
	});

function getFriends (userObject, res) {
	var friends = []; // Array of friends object
	for (var user in userObject.friends) {
		user.findOne({ username: userObject.friends[user] }, function (err, friend) {
			if (err) console.log('ERR: Error searching for friends ' + err);
			if (err) {
				res.send(makeStatusObject(500));
			} else {
				friends.push(user);
			}
		});
	}
	return friends;
}

/**
 * Function to check the validity of request headers
 * @param  {Array} expected Array ofexpected headers
 * @param  {JSON} actual    JSON object of actual request headers and results
 * @return {Boolean}        True if valid, false if invalid
 */
function checkHeaders (expected, actual) {
	for (var header in expected) {
		if (!(expected[header] in actual)) {
			return false;
		}
	}
	return true;
}

/**
 * Function to generate a random code to be texted to the user
 * @return {Number} Four digit code to be verified
 */
function generateCode () {
	var length = 4;
	var random = Math.random();
	var code = Math.round(random * Math.pow(10, length));
	var stringCode = code + '';
	while (stringCode.length < 4) {
		stringCode = stringCode + ('' + Math.random() * 10);
	}
	return parseInt(stringCode);
}

/**
 * Function to send a text message with a verification code to the user.
 * @param  {Number} toNumber Phone number that the text is to be sent to
 * @param  {Number} code     Random code to be used by the user to authenticate
 */
function sendText (toNumber, body) {
	// Your accountSid and authToken from twilio.com/user/account
	var accountSid = 'AC6bcdd4b4386163cef2fa8141b6330bf2';
	var authToken = '3f5cedbfd376649646600b8548ed0014';
	var fromNumber = '3609306560';
	var client = require('twilio')(accountSid, authToken);
	 
	client.messages.create({
		body: body,
		to: toNumber,
		from: fromNumber
	}, function(err, message) {
		if (err) {
			console.log('ERR: Error sending text message ' + err);
		}
	});
}

/**
 * Function to generate a status code object
 * @param  {Number} statusCode HTTP status code to be objectified
 * @return {JSON}            JSON object with key 'status' containing the error code.
 */
function makeStatusObject(statusCode) {
	var statusObject = {
		status: statusCode
	}
	console.log('RESPONSE CODE: ' + statusCode);
	return statusObject;
}

app.use('/', router)
var port = process.env.port || 80;
app.listen(port);
console.log('Express server listening on port ' + port);