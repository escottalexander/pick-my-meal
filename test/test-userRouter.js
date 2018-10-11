const chai = require("chai");
const chaiHttp = require("chai-http");

const {
    TEST_DATABASE_URL,
    PORT
} = require('../config');

const {
    app,
    runServer,
    closeServer
} = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

const newUser = {
    name: "John Doe",
    username: "JohnDoe91",
    password: "password1"
};
// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("User Authentication Router", function () {
    // Before our tests run, we activate the server. Our `runServer`
    // function returns a promise, and we return the that promise by
    // doing `return runServer`. If we didn't return a promise here,
    // there's a possibility of a race condition where our tests start
    // running before our server has started.
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    // although we only have one test module at the moment, we'll
    // close our server at the end of these tests. Otherwise,
    // if we add another test module that also has a `before` block
    // that starts our server, it will cause an error because the
    // server would still be running from the previous tests.
    after(function () {
        return closeServer();
    });

    // test strategy:
    //   1. make request to `/shopping-list`
    //   2. inspect response object and prove has right code and have
    //   right keys in response object.
    it("should return 200 HTTP status code on GET", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.
        return chai
            .request(app)
            .get("/user")
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
            });
    });

    it("should return 201 HTTP status code on new user register", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.

        return chai
            .request(app)
            .post("/user/register")
            .send(newUser)
            .then(function (res) {
                expect(res).to.have.status(201);
            });
    });

    it("should return 200 HTTP status code on log out", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.

        return chai
            .request(app)
            .get("/user/logout")
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });

    it("should return 200 HTTP status code on log in", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.

        return chai
            .request(app)
            .post("/user/login")
            .send(newUser)
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });

    it("should return 204 HTTP status code on PUT and user object should be updated", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.
        newUser.name = "Joseph Smith";
        delete newUser.password;
        return chai
            .request(app)
            .get("/user")
            .then(function (res) {
                newUser.id = res.body.users[0].id;
                return chai.request(app)
                    .put(`/user/${res.body.users[0].id}`)
                    .send(newUser)
                    .then(function (res) {
                        console.log(res)
                        expect(res).to.have.status(204);
                        return chai
                            .request(app)
                            .get("/user")
                            .then(function (res) {
                                expect(res.body.users[0].name).to.equal("Joseph Smith");
                            });
                    });
            });
    });

    it("should delete items on DELETE", function () {
        return (
            chai
            .request(app)
            // first have to get so we have an `id` of item
            // to delete
            .get("/user")
            .then(function (res) {
                return chai.request(app).delete(`/user/${res.body.users[0].id}`);
            })
            .then(function (res) {
                expect(res).to.have.status(204);
            })
        );
    });
});