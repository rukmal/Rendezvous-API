
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

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

var router = express.Router();

router.get('/', function (req, res) {
	res.send('Welcome to the Rendezvous API.');
});

router.route('/user/new/')
	.post(function (req, res) {
		expectedHeaders = ['firstname', 'lastname', 'username', 'email', 'picture', 'phone'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(400);
		}
		// CHECK API KEY HERE
		// Saving the new information in the migration database
		var newUser = new userhold({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			password: req.body.password,
			phone: req.body.phone,
			email: req.body.email,
			picture: req.body.picture,
			username: req.body.username,
			authCode: generateCode()
		})
		// saving the user to the database
		newUser.save(function (err) {
			if (err) {
				res.send(409);
			} else {
				sendText(newUser.phone, newUser.authCode);
				res.send(200);
			}
		});
	})

	// Moving user info from the temporary database to the actual one
	.put(function (req, res) {
		expectedHeaders = ['username', 'code'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(400);
		}
		// CHECK API KEY HEREf
		userhold.findOne({ username: req.body.username }, function (err, tempUser) {
			if (err) console.log('ERR: Error searching for user ' + err);
			if (tempUser.authCode === req.body.code) {
				if (tempUser) {
					delete tempUser[authCode];
					var permanentUser = new users(tempUser);
					permanentUser.save(function (error) {
						if (err) {
							res.send(409);
						} else {
							res.send(permanentUser);
						}
					});
				} else {
					delete req.body;
					res.send(204);
				}
			} else {
				res.send(401);
			}
		});
	});

router.route('/user/login')
	.post(function (req, res) {
		expectedHeaders = ['username', 'password', 'key'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(400);
		}
		// CHECK API KEY HERE
		// Isolating request parameters
		var uname = req.body.username;
		var password = req.body.password;
		// Searching database
		users.findOne({ 'username': uname }, function (err, user) {
			if (err) console.log('ERR: Error searching for user ' + err);
			if (user) {
				// Comparing passwords
				bcrypt.compare(password, user.password, function (err, result) {
					if (err) console.log('ERR: Error comparing passwords ' + err);
					if (result) {
						res.send(user);
					} else {
						res.send(401);
					}
				});
			} else {
				delete req.body;
				res.send(204);
			}
		});
	});

/**
 * Function to check the validity of request headers
 * @param  {Array} expected Array ofexpected headers
 * @param  {JSON} actual    JSON object of actual request headers and results
 * @return {Boolean}        True if valid, false if invalid
 */
function checkHeaders (expected, actual) {
	for (header in expected) {
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
	var code = random * Math.pow(10, length);
	return Math.round(code);
}

/**
 * Function to send a text message with a verification code to the user.
 * @param  {Number} toNumber Phone number that the text is to be sent to
 * @param  {Number} code     Random code to be used by the user to authenticate
 */
function sendText (toNumber, code) {
	// Your accountSid and authToken from twilio.com/user/account
	var accountSid = 'AC6bcdd4b4386163cef2fa8141b6330bf2';
	var authToken = '3f5cedbfd376649646600b8548ed0014';
	var fromNumber = '3609306560';
	var client = require('twilio')(accountSid, authToken);
	 
	client.messages.create({
		body: 'Welcome to Rendezvous! Your verification code is ' + code + '.',
		to: toNumber,
		from: fromNumber
	}, function(err, message) {
		if (err) {
			console.log(err);
		}
	});
}

app.use('/', router)
var port = process.env.port || 80;
app.listen(port);
console.log('Express server listening on port ' + port);