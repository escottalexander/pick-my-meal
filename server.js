const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require("passport");
const bodyParser = require("body-parser");

mongoose.Promise = global.Promise;

const {
    router: authRouter,
    localStrategy,
    jwtStrategy
} = require('./auth');

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
/** Notice all requests to meals endpoint are authenticated with our JWT strategy. */
app.use("/meals", jwtAuth, mealRouter);


app.use('*', (req, res) => {
    return res.status(404).json({
        message: 'Not Found'
    });
});


let server;

/** This function starts the server and returns a Promise. */
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

/** This function closes the server, and returns a Promise. */
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

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};