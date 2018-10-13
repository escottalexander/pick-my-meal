const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
// const LocalStrategy = require("passport-local");
//const flash = require("connect-flash");
//const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const {
    User
} = require('./models');

//POST Register
router.post("/register", jsonParser, function (req, res) {
    const requiredFields = ['name', 'username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    const stringFields = ['name', 'username', 'password'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }
    // If the username and password aren't trimmed we give an error.  Users might
    // expect that these will work without trimming (i.e. they want the password
    // "foobar ", including the space at the end).  We need to reject such values
    // explicitly so the users know what's happening, rather than silently
    // trimming them and expecting the user to understand.
    // We'll silently trim the other fields, because they aren't credentials used
    // to log in, so it's less of a problem.
    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }
    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10,
            // bcrypt truncates after 72 characters, so let's not give the illusion
            // of security by storing extra (unused) info
            max: 72
        }
    };
    const tooSmallField = Object.keys(sizedFields).find(
        field =>
        'min' in sizedFields[field] &&
        req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
        'max' in sizedFields[field] &&
        req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField ?
                `Must be at least ${sizedFields[tooSmallField]
          .min} characters long` : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }
    let {
        name,
        username,
        password
    } = req.body;
    name = name.trim();
    return User.find({
            username
        })
        .countDocuments()
        .then(count => {
            if (count > 0) {
                // There is an existing user with the same username
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            // If there is no existing user, hash the password
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                name,
                username,
                password: hash,
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            // Forward validation errors on to the client, otherwise give a 500
            // error because something unexpected has happened
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({
                code: 500,
                message: 'Internal server error'
            });
        });
});

//PUT Change name NOT username or password
router.put('/:id', (req, res) => {

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `
        Request path id(${
            req.params.id
        }) and request body id ` +
            `(${
            req.body.id
        }) must match `);
        console.error(message);
        // we return here to break out of this function
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['name'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    User
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(user => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});

//DELETE user
router.delete('/:id', (req, res) => {
    User
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch(err => res.status(500).json({
            message: err
        }));
});

//GET User for development only
router.get('/', (req, res) => {
    User
        .find()
        .then(users => {
            res.json({
                users: users.map(
                    (user) => user.serialize())
            });
        })
        .catch(
            err => {
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
});

module.exports = router;