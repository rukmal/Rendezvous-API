
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

// Database stuff
var dbURL = 'mongodb://localhost';
mongoose.connect(dbURL);
var users = require('./models/User');

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

var router = express.Router();

router.get('/', function (req, res) {
	res.send('Welcome to the Rendezvous API.', 200);
});

router.route('/user/new')
	.post(function (req, res) {
		expectedHeaders = ['firstname', 'lastname', 'username', 'email', 'picture'];
		if (!checkHeaders(expectedHeaders, req.body)) {
			res.send(400);
		}
		// CHECK API KEY HERE
		// Isolating request parameters
		var uname = req.body.username;
		var password = req.body.password;
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var email = req.body.email;
		var picture = req.body.picture;
	});

router.route('/user/login')
	.post(function (req, res, next) {
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
	for (header in actual) {
		if (expected.indexOf(header) === -1) {
			return false;
		}
	}
	return true;
}

app.use('/', router)
var port = process.env.port || 80;
app.listen(port);
console.log('Express server listening on port ' + port);