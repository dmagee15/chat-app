'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Room = new Schema({
        name: String,
		messages: Array,
});

module.exports = mongoose.model('Room', Room);
