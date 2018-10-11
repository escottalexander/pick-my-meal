const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const passportLocalMongoose = require("passport-local-mongoose");
mongoose.Promise = global.Promise;

const {
    DATABASE_URL,
    PORT
} = require('./config');

// const {
//     User,
//     Meal
// } = require('./models');

const userRouter = require("./userRouter");
const mealRouter = require("./mealRouter");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(require("express-session")({
    secret: "Rusty is the best og in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
app.use(morgan('common'));
app.use(express.static('public'));

app.use("/user", userRouter);
app.use("/meals", mealRouter);

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