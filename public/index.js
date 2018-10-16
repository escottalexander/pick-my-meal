function logInSequence() {
    event.preventDefault();
    let username = $("input[name='username']").val();
    let password = $("input[name='password']").val();

    let userObject = {
        name,
        username,
        password
    };

    $.ajax({
            type: 'POST',
            url: '/auth/login',
            dataType: 'json',
            data: JSON.stringify(userObject),
            contentType: 'application/json'
        })
        .done(token => {
            localStorage.setItem('authToken', token.authToken);
            localStorage.setItem('user', JSON.stringify(token.user));
            displayUserMenu();
        })
        .fail((err) => {
            console.error(err);
        });
}


function logInScreen() {
    $('main').empty();
    $('main').append(
        `<h2>Please log in to see your meals</h2>
        <form action='none'>
        <label for="username">Username</label><input id="username" type="username" name="username" value="TrialAccount"></input>
        <label for="password">Password</label><input id="password" type="password" name="password" value="TrialAccount"></input>
        <button type="button" class="log-in">Log In</button>
        <h2>Don't have an account?</h2>
        <button type="button" class="create-user">Register new account</button>
        </form>
        `);
}

function logOutSequence() {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    $('nav').detach();
    logInScreen();
}

function createUser() {
    event.preventDefault();
    //register new user in db
    $('main').empty();
    $('main').append(
        `<h2>Please register by filling out the form below</h2>
        <div class="msg-handler hidden" aria-live="assertive"></div>
        <form action='none'>
        <label for="name">Name</label><input id="name" type="name" name="name" required></input>
        <label for="username">Username</label><input id="username" type="username" name="username" required></input>
        <label for="password">Password</label><input id="password" type="password" name="password" required></input>
        <label for="password-again">Password Again</label><input id="password-again" type="password" name="password-again" required></input>
        <button type="button" class="register">Register</button>
        </form>
        `);
}

function validateRegistration() {
    event.preventDefault();
    let name = $("input[name='name']").val();
    let username = $("input[name='username']").val();
    let password = $("input[name='password']").val();
    let passwordAgain = $("input[name='password-again']").val();

    let userObject = {
        name,
        username,
        password
    };

    if (password !== passwordAgain) {
        clientErrorHandler("Passwords must match");
    } else if (password.length < 10) {
        clientErrorHandler("Password must be at least ten characters");
    } else {
        $.ajax({
                type: 'POST',
                url: '/user/register',
                dataType: 'json',
                data: JSON.stringify(userObject),
                contentType: 'application/json'
            })
            .done(() => {
                console.log('registered successfully');
                logInScreen();
            })
            .fail((err) => {
                if (err.code === 406) {
                    clientErrorHandler("Please choose a different username");
                } else {
                    console.error(err);
                }
            });

    }
}

function clientErrorHandler(msg) {
    $(".msg-handler").html(`
<h2>${msg}</h2>
`).slideDown(500, () => $(".msg-handler").delay(6000).slideUp(500));
}

function getMeals(callbackFn) {
    let token = localStorage.getItem('authToken');

    $.ajax({
            type: 'GET',
            url: `/meals`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(data => {
            localStorage.setItem('mealData', JSON.stringify(data));
            callbackFn(data);
        })
        .fail(err => {
            console.error(err);
        });
}

function postMeal(meal) {
    let token = localStorage.getItem('authToken');

    $.ajax({
            type: 'POST',
            url: `/meals`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            data: JSON.stringify(meal),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            getAndDisplayMeals();
        })
        .fail(err => {
            console.error(err);
        });
}

function putMeal(meal) {
    let id = $("input[name='meal-name']").attr('meal-id');
    meal.id = id;

    let token = localStorage.getItem('authToken');

    $.ajax({
            type: 'PUT',
            url: `/meals/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            data: JSON.stringify(meal),
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            getAndDisplayMeals();
        })
        .fail(err => {
            console.error(err);
        });
}

function deleteMeal(meal) {
    let id = $(this).attr('mealId');

    let token = localStorage.getItem('authToken');

    $.ajax({
            type: 'DELETE',
            url: `/meals/${id}`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            dataType: 'json',
            contentType: 'application/json',
        })
        .done(() => {
            getAndDisplayMeals();
        })
        .fail(err => {
            console.error(err);
        });
}

// this function stays the same when we connect
// to real API later
function displayListOfMeals(data) {
    navBar("mealsView")
    $('main').empty();
    $('main').append(`
    `);
    for (let index in data.meals) {
        $('main').append(`
        <div class="meal" id="meal-${index}">
        <h3 class="dish-name">${data.meals[index].mealName}</h3>
            ${data.meals[index].mealImage ? `<img alt="A picture of this meal" class="meal-image" src=${data.meals[index].mealImage} />` : ''}
            ${data.meals[index].cuisine !== '' ? `<p>Cuisine: ${data.meals[index].cuisine}</p>` : ''}
            ${renderSideDishes(data.meals[index].sideDish)}
            <button class="edit-meal" id="edit-meal-${index}" index=${index} >Edit</button>
            <button class="delete-meal" id="delete-meal-${index}" mealId=${data.meals[index].id} >Delete</button>
            </div>
            `);
    }
    $('main').append(
        `
        <button class="add-meal">Add a meal</button>
        `);

}

function navBar(page) {
    $('nav').detach();
    let user = JSON.parse(localStorage.getItem('user'));
    $('body').prepend(`
<nav>
${page === "mainView"? "<a class='main-menu' disabled>Main Menu</a>" : "<a class='main-menu'>Main Menu</a>" }
<a class='log-out'>Log Out</a>
<p>Logged in as ${user.name}</p>
</nav>
`);
}

function renderSideDishes(arr) {
    if (arr[0] !== '') {
        let allSides = [];
        allSides.push('<p>Served with:</p><ul class="sides">');
        for (let index in arr) {
            allSides.push(`<li class="side-dish">${arr[index]}</li>`);
        }
        allSides.push('</ul>');
        return allSides.join('');
    } else {
        return '';
    }
}

function editMeal(event) {
    //GET user and current meal
    let data = JSON.parse(localStorage.getItem('mealData'));
    let index = $(event.currentTarget).attr('index');
    navBar("editView");
    $('main').empty();
    $('main').append(`
        <form action='none'>
        <label for="meal-name">Meal Name: </label><input id="meal-name" type="meal" name="meal-name" meal-id='${data.meals[index].id}' value="${data.meals[index].mealName}"></input>
        <label for="cuisine">Cuisine: </label><input id="cuisine" type="cuisine" name="cuisine" value="${data.meals[index].cuisine}"></input>
        <label for="side-dishes">Side Dishes: </label><input id="side-dishes" type="side" name="side-dishes" value="${data.meals[index].sideDish.join(", ")}"></input>
        <button type="button" class="save">Save meal</button>
        <button class="cancel-edit">Cancel edit</button>
        </form>
        `);
}

function addMeal(event) {
    event.preventDefault();
    navBar("addView");
    $('main').empty();
    $('main').append(`
    <label for="meal-name">Meal Name: </label><input type="meal" name="meal-name"></input>
    <label for="cuisine">Cuisine: </label><input type="cuisine" name="cuisine"></input>
    <label for="side-dishes">Side Dishes: </label><input type="side" name="side-dishes"></input>
    <button class="save">Save meal</button>
    <button class="cancel-edit">Cancel edit</button>
        `);
}

function saveMeal(event) {
    let user = JSON.parse(localStorage.getItem('user'));
    event.preventDefault();
    let newMealName = $("input[name='meal-name']").val();
    let newCuisine = $("input[name='cuisine']").val();
    let unformattedSideDishes = $("input[name='side-dishes']").val();
    let sideDishes = unformattedSideDishes.split(",").map(element => {
        return $.trim(element);
    });
    const newMealData = {
        username: user.username,
        mealName: newMealName,
        sideDish: sideDishes,
        cuisine: newCuisine,
    };
    if ($("input[name='meal-name']").attr('meal-id')) {
        //PUT edited items into old meal
        putMeal(newMealData);
    } else {
        //POST new meal
        postMeal(newMealData);
    }
}

function getAndDisplayMeals() {
    event.preventDefault();
    getMeals(displayListOfMeals);
}

function displayUserMenu() {
    navBar("mainView");
    $('main').empty();
    $('main').append(`
    <button class="random-meal">Choose a random meal</button>
    <h3>Or</h3>
    <button class="view-meals">View my meals</button>
        `);
}

function getRandomMeal() {
    navBar("randomMealView");
    $('main').empty();
    getMeals((data) => {
        let randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];
        $('main').append(`
        <h3>Your Random meal is...</h3>
        <div class="random-meal">
            <h3 class="meal-name">${randomMeal.mealName}</h3>
                ${randomMeal.mealImage ? `<img alt="A picture of ${randomMeal.mealName}" class="meal-image" src=${randomMeal.mealImage} />` : ''}
                ${randomMeal.cuisine !== '' ? `<p>Cuisine: ${randomMeal.cuisine}</p>` : ''}
                ${renderSideDishes(randomMeal.sideDish)}
        </div>
        <button class="random-meal">Try again</button>   
        <button class="view-meals">View all meals</button>
        `);
    });
}

$(function () {
    logInScreen();
    $("main").on("click", ".log-in", logInSequence);
    $("main").on("click", ".create-user", createUser);
    $("main").on("click", ".register", validateRegistration);
    $("body").on("click", ".log-out", logOutSequence);
    $("body").on("click", ".main-menu", displayUserMenu);
    $("main").on("click", ".random-meal", getRandomMeal);
    $("main").on("click", ".view-meals", getAndDisplayMeals);
    $("main").on("click", ".edit-meal", editMeal);
    $("main").on("click", ".cancel-edit", getAndDisplayMeals);
    $("main").on("click", ".save", saveMeal);
    $("main").on("click", ".add-meal", addMeal);
    $("main").on("click", ".delete-meal", deleteMeal);
});