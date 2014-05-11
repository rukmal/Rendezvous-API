/**
 * @author Rukmal Weerawarana
 *
 * @description Mongoose model for the current status of a user
 */

var mongoose = require('mongoose');

var statusSchema = new mongoose.Schema({
	time: {
		type: Date,
		required: true
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
		required: true
	},

	isExpired: {
		type: Boolean,
		required: true,
		default: false
	}
});

module.exports = mongoose.model('Status', statusSchema);