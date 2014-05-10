/**
 * @author Rukmal Weerawarana
 *
 * @description Schema for a 'holding' database for the user. Holds temporary
 *              user objects until the point at which they have been verified
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var userHoldSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: true
	},

	lastname: {
		type: String,
		required: true
	},

	password: {
		type: String,
		required: true
	},

	username: {
		type: String,
		required: true,
		unique: true
	},

	phone: {
		type: Number,
		required: true
	},

	email: {
		type: String,
		required: true,
		unique: true
	},

	picture: {
		type: String,
		required: false
	},

	account_status: {
		type: Boolean,
		required: true,
		default: false
	},

	friends: {
		type: Array,
		required: false,
		default: []
	},

	currentStatusID: {
		type: String,
		required: false
	},

	pastStatuses: {
		type: Array,
		required: false,
		default: []
	},

	authCode: {
		type: Number,
		required: true,
	}
});

userHoldSchema.pre('save', function (next) {
	var user = this;
	// If the password isn't modified, save as is
	if (!user.isModified('password')) return next;
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) console.log('ERR: Salt generation error ' + err);
		// hash and save the password using the salt
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) console.log('ERR: Hashing password error ' + err);
			// overriding password
			user.password = hash;
			next();
		});
	});
});

module.exports = mongoose.model('Hold', userHoldSchema);