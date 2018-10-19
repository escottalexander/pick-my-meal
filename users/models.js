'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

/** The schema for the meals object */
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

/** The define the serialize method for the meals object */
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

/** The schema for the users object */
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

/** The define the serialize method for the user object */
userSchema.methods.serialize = function () {
    return {
        id: this._id || '',
        name: this.name || '',
        username: this.username || '',
        created: this.created || ''
    };
};

/** Initialize password validation method on user*/
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

/** Initialize password hashing static on user*/
userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = {
    Meal,
    User
};