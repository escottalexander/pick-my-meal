const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {
    DATABASE_URL,
    PORT
} = require('./config');

const app = express();
app.use(express.json());

app.use(morgan('common'));
app.use(express.static('public'));

const {
    User,
    Meal
} = require('./models');

//GET
app.get('/user', (req, res) => {
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


//POST
app.post('/user', (req, res) => {

    const requiredFields = ['name', 'username', 'password'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    User
        .create({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        })
        .then(
            meal => res.status(201).json(meal.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: err
            });
        });
});

//PUT
app.put('/user/:id', (req, res) => {

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
    const updateableFields = ['name', 'username', 'password', 'meals'];

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

//DELETE
app.delete('/user/:id', (req, res) => {
    User
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});

//GET
app.get('/meal', (req, res) => {
    const filters = {};
    const queryableFields = ['cuisine'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    Meal
        .find(filters)
        .then(meals => {
            res.json({
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


//POST
app.post('/meal', (req, res) => {

    const requiredFields = ['mealName'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Meal
        .create({
            mealName: req.body.mealName,
            cuisine: req.body.cuisine,
            sideDish: req.body.sideDish
        })
        .then(
            meal => res.status(201).json(meal.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: err
            });
        });
});

//PUT
app.put('/meal/:id', (req, res) => {
    console.log(req, res);
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

//DELETE
app.delete('/meal/:id', (req, res) => {
    Meal
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: err
        }));
});

let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};