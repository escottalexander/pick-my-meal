const MOCK_MEAL_INFO = {
    "user": {
        "name": "Trial User",
    },
    "meals": [{
            "id": "1111111",
            "dishName": "Eggplant Parmesan",
            "sideDish": ["Asparagus"],
            "cuisine": "Italian",
            "dishImage": null,
            "publishedAt": 1470016976609
        },
        {
            "id": "2222222",
            "dishName": "Spaghetti with Meatballs",
            "sideDish": ["Garlic Bread", "Salad"],
            "cuisine": "Italian",
            "dishImage": null,
            "publishedAt": 1470012976609
        },
        {
            "id": "333333",
            "dishName": "Enchiladas",
            "sideDish": ["Chips", "Salsa", "Queso"],
            "cuisine": "Mexican",
            "dishImage": null,
            "publishedAt": 1470011976609
        },
        {
            "id": "4444444",
            "dishName": "Cheeseburgers",
            "sideDish": ["French Fries", "Chili"],
            "cuisine": "American",
            "dishImage": null,
            "publishedAt": 1470009976609
        }
    ]
};

function logInSequence() {
    //authenticate
    displayUserMenu();
}


function initialLoad() {
    $('main').empty();
    $('main').append(
        `<h2>Please log in to see your meals</h2>
        <label for="username">Username</label><input type="username" name="username" value="TrialAccount"></input>
        <label for="password">Password</label><input type="password" name="password" value="TrialAccount"></input>
        <button class="log-in">Log In</button>
        `);
}

function getMeals(callbackFn) {
    setTimeout(function () {
        callbackFn(MOCK_MEAL_INFO);
    }, 100);
}

// this function stays the same when we connect
// to real API later
function displayListOfMeals(data) {
    $('main').empty();
    $('main').append(`<h2>Logged in as ${MOCK_MEAL_INFO.user.name}</h2>`);
    for (let index in data.meals) {
        $('main').append(`
        <div class="meal" id="meal-${index}">
        <h3 class="dish-name">${data.meals[index].dishName}</h3>
            ${data.meals[index].dishImage ? `<img alt="A picture of this meal" class="dish-image" src=${data.meals[index].dishImage} />` : ''}
            <p>Cuisine: ${data.meals[index].cuisine}</p>
            ${renderSideDishes(data.meals[index].sideDish)}
            <button class="edit-meal" id="edit-meal-${index}" index=${index} >Edit this meal</button>
            `);
    }
    $('main').append(
        `
        <button class="add-meal">Add a meal</button>
        `);

}

function renderSideDishes(arr) {
    if (arr) {
        let allSides = [];
        allSides.push('<p>Served with:</p><ul class="sides">');
        for (let index in arr) {
            allSides.push(`<li class="side-dish">${arr[index]}</li>`);
        }
        allSides.push('</ul>');
        return allSides.join('');
    }
}

function editMeal(event) {
    //console.log(event);
    //GET
    let index = $(event.currentTarget).attr('index');
    $('main').empty();
    $('main').append(
        `<h2>Logged in as ${MOCK_MEAL_INFO.user.name}</h2>
        <label for="meal-name">Meal Name: </label><input type="meal" name="meal-name" meal-id='${MOCK_MEAL_INFO.meals[index].id}' value="${MOCK_MEAL_INFO.meals[index].dishName}"></input>
        <label for="cuisine">Cuisine: </label><input type="cuisine" name="cuisine" value="${MOCK_MEAL_INFO.meals[index].cuisine}"></input>
        <label for="side-dishes">Side Dishes: </label><input type="side" name="side-dishes" value="${MOCK_MEAL_INFO.meals[index].sideDish.join(", ")}"></input>
        <button class="save">Save meal</button>
        <button class="cancel-edit">Cancel edit</button>
        `);
}

function saveMeal(event) {

    //POST new meal or save edit to old meal
    let newDishName = $("input[name='meal-name']").val();
    let newCuisine = $("input[name='cuisine']").val();
    let unformattedSideDishes = $("input[name='side-dishes']").val();
    let sideDishes = unformattedSideDishes.split(",").map(element => {
        return $.trim(element);
    });
    const newMealData = {
        "dishName": newDishName,
        "sideDish": sideDishes,
        "cuisine": newCuisine,
    };
    if ($("input[name='meal-name']").attr('meal-id')) {
        //PUT
        let id = $("input[name='meal-name']").attr('meal-id');
        let indexOfItem;
        for (let index in MOCK_MEAL_INFO.meals) {
            if (MOCK_MEAL_INFO.meals[index].id === id) {
                indexOfItem = index;
            }
        }
        MOCK_MEAL_INFO.meals[indexOfItem].dishName = newMealData.dishName;
        MOCK_MEAL_INFO.meals[indexOfItem].sideDish = newMealData.sideDish;
        MOCK_MEAL_INFO.meals[indexOfItem].cuisine = newMealData.cuisine;
    } else {
        //POST
    }

    getAndDisplayMeals();
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayMeals() {
    getMeals(displayListOfMeals);
}

function displayUserMenu() {
    $('main').empty();
    $('main').append(
        `<h2>Logged in as ${MOCK_MEAL_INFO.user.name}</h2>
        <button class="random-meal">Choose a random meal!</button>
        <h3>Or</h3>
        <button class="view-meals">View my meals</button>
        `);
}

function getRandomMeal() {
    $('main').empty();
    getMeals(function (data) {
        let randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];
        $('main').append(
            `<h2>Logged in as ${data.user.name}</h2>
        <h3>Your Random meal is...</h3>
        <h3 class="dish-name">${randomMeal.dishName}</h3>
                ${randomMeal.dishImage ? `<img alt="A picture of this meal" class="dish-image" src=${randomMeal.dishImage} />` : ''}
                <p>Cuisine: ${randomMeal.cuisine}</p>
                ${renderSideDishes(randomMeal.sideDish)}
        <button class="random-meal">Try again</button>   
        <button class="view-meals">View all meals</button>
        `);
    });
}

$(function () {
    initialLoad();
    $("main").on("click", ".log-in", logInSequence);
    $("main").on("click", ".random-meal", getRandomMeal);
    $("main").on("click", ".view-meals", getAndDisplayMeals);
    $("main").on("click", ".edit-meal", editMeal);
    $("main").on("click", ".cancel-edit", getAndDisplayMeals);
    $("main").on("click", ".save", saveMeal);
});