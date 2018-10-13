'use strict'
const chai = require("chai");
const chaiHttp = require("chai-http");

const {
    TEST_DATABASE_URL,
    PORT
} = require("../config");

const {
    app,
    runServer,
    closeServer
} = require("../server");

const {
    User,
    Meal
} = require("../users");


const expect = chai.expect;
chai.use(chaiHttp);

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



describe("Meal endpoints", function () {
    // Before starting tests, start the server and register a   
    // new user who will be used by chai to complete tests
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });


    // After all the tests, Delete user from database and close server
    after(function () {
        return closeServer();
    });

    this.afterEach(function () {
        return User.remove({});
    });

    it("should return 200 HTTP status code on GET", function () {

        return chai
            .request(app)
            .get("/meals")
            .then(function (res) {
                expect(res).to.have.status(200);
            });

    });

    it("should return 200 HTTP status code on POST", function () {

        return chai
            .request(app)
            .post("/meals")
            .send(newMeal)
            .then(function (res) {
                expect(res).to.have.status(200);
            });
    });

    it("should return 204 HTTP status code on PUT and meal object should be updated", function () {

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