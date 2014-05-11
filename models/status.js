/**
 * @author Rukmal Weerawarana
 *
 * @description Mongoose model for the current status of a user
 */

var mongoose = require('mongoose');

var statusSchema = new mognoose.Schmea({
	time: {
		type: Date,
		required: true,
		default: Date.now();
	},

	uniqueID: {
		type: String,
		required: true,
		// default: 
	}
})