const express = require("express");
const router = express.Router();

const {
    Meal
} = require('./models');

//GET Pull up users meals
router.get('/', (req, res) => {
    Meal
        .find({
            userId: req.user.userId
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
            userId: req.user.userId,
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

//DELETE meal
router.delete('/:id', (req, res) => {
    Meal
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});


module.exports = router;