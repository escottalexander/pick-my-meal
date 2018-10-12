'use strict';

const mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.Promise = global.Promise;


const mealSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    mealName: {
        type: String,
        required: true
    },
    cuisine: {
        type: String
    },
    sideDish: [String],
    created: {
        type: Date,
        default: Date.now
    }
});

mealSchema.methods.serialize = function () {
    return {
        id: this._id,
        userId: this.UserId,
        mealName: this.mealName,
        cuisine: this.cuisine,
        sideDish: this.sideDish,
        created: this.created
    };
};

const Meal = mongoose.model('Meal', mealSchema);

const userSchema = mongoose.Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    meals: [mealSchema],
    created: {
        type: Date,
        default: Date.now
    }
});


userSchema.methods.serialize = function () {
    return {
        id: this._id || '',
        name: this.name || '',
        username: this.username || '',
        created: this.created || ''
    };
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = {
    Meal,
    User
};