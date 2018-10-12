const express = require("express");
const router = express.Router();
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const {
    User
} = require('../models');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//POST Register
router.post("/register", function (req, res) {
    const requiredFields = ['name', 'username', 'password'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    User
        .register(new User({
            name: req.body.name,
            username: req.body.username
        }), req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                return err;
            } //user strategy
            passport.authenticate("local")(req, res, function () {
                //res.redirect("/secret"); //once the user sign up
                res.status(201).end();
            });
        });
});

// POST Login
router.post("/login", passport.authenticate("local", {
    successFlash: "Welcome",
    failureRedirect: "/login"
}), function (req, res) {
    res.status(200).json({
        message: `${req.user.username}, ID:${req.user.id} is now logged in.`
    });
});

// GET Logout
router.get("/logout", function (req, res) {
    req.logout();
    res.status(200).json({
        message: "User has been logged out"
    });
});

//PUT Change username or name NOT password
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
    const updateableFields = ['name', 'username'];

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
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});


///DEV ONLY ROUTES
//GET User for development only
router.get('/', (req, res) => {
    //console.log(req)
    const filters = {};
    const queryableFields = ['cuisine'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    User
        .find(filters)
        .then(users => {
            res.json({
                users: users.map(
                    (user) => user.serialize())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
});

module.exports = router;