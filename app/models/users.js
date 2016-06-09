'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    username: String,
	twitter: {
		id: String
	},
	curr_location: String
});

module.exports = mongoose.model('User', User);