'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Business = new Schema({
    id: String,
    twitter_id: String
   /*username: String,
	twitter: {
		id: String
	}*/
});

module.exports = mongoose.model('Business', Business);