'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

const createAuthToken = function (user) {
    return jwt.sign({
        user
    }, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', {
    session: false
});

router.use(bodyParser.json());

/** This endpoint authenticates the user by the local strategy and then gives them a token to be used to authenticate with our JWT strategy. */
router.post('/login', localAuth, (req, res) => {
    const authToken = createAuthToken(req.user.serialize());
    res.json({
        user: {
            username: req.user.username,
            name: req.user.name
        },
        authToken
    });
});

const jwtAuth = passport.authenticate('jwt', {
    session: false
});

/** This endpoint takes an existing valid JWT token and returns a fresh token. */
router.post('/refresh', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({
        authToken
    });
});

module.exports = {
    router
};