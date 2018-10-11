const express = require("express");
const router = express.Router();
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const passportLocalMongoose = require("passport-local-mongoose");
//mongoose.Promise = global.Promise;
const passport = require("passport");

const {
    User,
    Meal
} = require('./models');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//GET Pull up users meals
router.get('/', isLoggedIn, (req, res) => {
    Meal
        .find({
            userId: req.user._id
        })
        .then(meals => {
            res.status(200).json({
                meals: meals.map(
                    (meal) => meal.serialize())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({
                    message: err
                });
            });
});

//POST Add a meal
router.post('/', isLoggedIn, (req, res) => {
    console.log(req.body);
    const requiredFields = ['mealName'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    Meal.create({
            userId: req.user._id,
            mealName: req.body.mealName,
            cuisine: req.body.cuisine,
            sideDish: req.body.sideDish
        })
        .then(
            meal => res.status(201).json(meal))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: err
            });
        });
});

//PUT edit meal
router.put('/:id', isLoggedIn, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        // we return here to break out of this function
        return res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['mealName', 'cuisine', 'sideDish'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Meal
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(meal => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});

//DELETE meal
router.delete('/:id', isLoggedIn, (req, res) => {
    Meal
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login"); //Change this later
}

module.exports = router;