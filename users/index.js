'use strict';
const {
    User,
    Meal
} = require('./models');

const userRouter = require('./userRouter');
const mealRouter = require('./mealRouter');

module.exports = {
    User,
    Meal,
    userRouter,
    mealRouter
};