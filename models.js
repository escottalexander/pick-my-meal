'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;


const mealSchema = mongoose.Schema({
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
        mealName: this.mealName,
        cuisine: this.cuisine,
        sideDish: this.sideDish,
        created: this.created
    };
};


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
        meals: this.meals || '',
        created: this.created || ''
    };
};

const User = mongoose.model('User', userSchema);
const Meal = mongoose.model('Meal', mealSchema);

module.exports = {
    Meal,
    User
};