'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
//var passportLocalMongoose = require("passport-local-mongoose");

mongoose.Promise = global.Promise;


const mealSchema = mongoose.Schema({
    username: {
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
        username: this.username,
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
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = {
    Meal,
    User
};