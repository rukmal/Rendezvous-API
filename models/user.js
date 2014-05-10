/**
 * @author Rukmal Weerawarana
 *
 * @description Mongoose model for a user, and accompanying methods
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},

	lastName: {
		type: String,
		required: true
	},

	password: {
		type: String,
		required: true
	},

	userID: {
		type: String,
		required: true,
		unique: true
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
		required: true,
		default: []
	},

	currentStatusID: {
		type: String,
		required: false
	},

	pastStatuses: {
		type: Array,
		required: true,
		default: []
	}
});

mongoose.exports = mongoose.model('User', userSchema);