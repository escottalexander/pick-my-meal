const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require("passport");
const bodyParser = require("body-parser");

const {
    router: authRouter,
    localStrategy,
    jwtStrategy
} = require('./auth');
mongoose.Promise = global.Promise;

const {
    DATABASE_URL,
    PORT
} = require('./config');

const userRouter = require("./users/userRouter");
const mealRouter = require("./users/mealRouter");

const app = express();

app.use(morgan('common'));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
        return res.send(204);
    }
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.static('public'));

const jwtAuth = passport.authenticate('jwt', {
    session: false
});

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/meals", jwtAuth, mealRouter);


app.use('*', (req, res) => {
    return res.status(404).json({
        message: 'Not Found'
    });
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