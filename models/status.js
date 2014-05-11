/**
 * @author Rukmal Weerawarana
 *
 * @description Mongoose model for the current status of a user
 */

var mongoose = require('mongoose');

var statusSchema = new mongoose.Schema({
	time: {
		type: Date,
		required: true,
		default: Date.now
	},

	type: {
		type: String,
		required: true
	},

	location_lat: {
		type: Number,
		required: true
	},

	location_lon: {
		type: Number,
		required: true
	},

	expiration_time: {
		type: Date,
		required: true,
		default: Date.now // <-- Figure out a way to appenddate offset to this
	},

	isExpired: {
		type: Boolean,
		required: true,
		default: false
	}
});

module.exports = mongoose.model('Status', statusSchema);