var MOCK_MEAL_INFO = {
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
    for (index in data.meals) {
        $('main').append(
            `<h3 class="dish-name">${data.meals[index].dishName}</h3>
            ${data.meals[index].dishImage ? `<img alt="A picture of this meal" class="dish-image" src=${data.meals[index].dishImage} />` : ''}
            <p>Cuisine: ${data.meals[index].cuisine}</p>
            ${displaySideDishes(data.meals[index].sideDish)}
            `);
    }
}

function displaySideDishes(arr) {
    if (arr) {
        let allSides = [];
        allSides.push('<ul class="sides">');
        for (index in arr) {
            allSides.push(`<li class="side-dish">${arr[index]}</li>`);
        }
        allSides.push('</ul>');
        return allSides.join('');
    }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayMeals() {
    getMeals(displayListOfMeals);
}

$(function () {
    initialLoad();
    $("main").on("click", ".log-in", getAndDisplayMeals);
});