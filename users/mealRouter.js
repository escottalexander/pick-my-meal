const express = require("express");
const router = express.Router();

const {
    Meal
} = require('./models');

/** This endpoint is used to get the authenticated user's meals from the database. */
router.get('/', (req, res) => {
    Meal
        .find({
            username: req.user.username
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

/** This endpoint is used to add a new meal to the authenticated user's meal array in the database. */
router.post('/', (req, res) => {
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
            username: req.body.username,
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

/** This endpoint is used to update a specific meal in the authenticated user's database. */
router.put('/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` +
            `(${req.body.id}) must match`);
        console.error(message);
        //we return here to break out of this function
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

/** This endpoint is used to delete a meal from the authenticated user's meal array in the database. */
router.delete('/:id', (req, res) => {
    Meal
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});


module.exports = router;