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

const user = {
    name: "John Doe",
    username: "JohnDoe91",
    password: "password1"
};

const newMeal = {
    "mealName": "Spaghetti",
    "cuisine": "Italian",
    "sideDish": ["Meatballs", "Salad", "Garlic Bread"]
};

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("Meal Router", function () {
    // Before our tests run, we activate the server. Our `runServer`
    // function returns a promise, and we return the that promise by
    // doing `return runServer`. If we didn't return a promise here,
    // there's a possibility of a race condition where our tests start
    // running before our server has started.
    before(function () {
        return runServer(TEST_DATABASE_URL)
            .then(function () {
                return chai
                    .request(app)
                    .post("/user/register")
                    .send(user)
                    .then(function (res) {
                        expect(res).to.have.status(201);
                    });
            });
    });

    // although we only have one test module at the moment, we'll
    // close our server at the end of these tests. Otherwise,
    // if we add another test module that also has a `before` block
    // that starts our server, it will cause an error because the
    // server would still be running from the previous tests.
    after(function () {
        return (
            chai
            .request(app)
            // first have to get so we have an `id` of item
            // to delete
            .get("/user")
            .then(function (res) {
                return chai.request(app).delete(`/user/${res.body.users[0].id}`);
            }).then(function (res) {
                return closeServer();
            })
        );
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
            .post("/user/login")
            .send(user)
            .then(function (res) {
                return chai
                    .request(app)
                    .get("/meals")
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res).to.be.json;
                    });
            });

    });

    it("should return 200 HTTP status code on GET", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.

        return chai
            .request(app)
            .post("/meals")
            .send(newMeal)
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });

    it("should return 204 HTTP status code on PUT and meal object should be updated", function () {
        // for Mocha tests, when we're dealing with asynchronous operations,
        // we must either return a Promise object or else call a `done` callback
        // at the end of the test. The `chai.request(server).get...` call is asynchronous
        // and returns a Promise, so we just return it.
        newMeal.mealName = "Ravioli";
        return chai
            .request(app)
            .get("/meals")
            .then(function (res) {
                newMeal.id = res.body.meals[0].id;
                return chai.request(app)
                    .put(`/meals/${res.body.meals[0].id}`)
                    .send(newMeal)
                    .then(function (res) {
                        expect(res).to.have.status(204);
                        return chai
                            .request(app)
                            .get("/meals")
                            .then(function (res) {
                                expect(res.body.meals[0].mealName).to.equal("Ravioli");
                            });
                    });
            });
    });

    it("should delete meals on DELETE", function () {
        return (
            chai
            .request(app)
            // first have to get so we have an `id` of item
            // to delete
            .get("/meals")
            .then(function (res) {
                return chai.request(app).delete(`/meals/${res.body.meals[0].id}`);
            })
            .then(function (res) {
                expect(res).to.have.status(204);
            })
        );
    });
});