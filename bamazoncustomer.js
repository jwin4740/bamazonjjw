// NPM dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");
var $ = require("jquery");

// global variables
var currentUser;
var password;
var productsArray = [];
var productsIdArray = [];
var shoppingCartArray = [];
var cost = 0;
var totalOrderCost = 0;
var accountBalance = 0;

// creates connection to mysql
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "platinum",

});

// constructor function for products
function Product(id, product, product_description, department, price, quantity) {
    this.id = id;
    this.product = product;
    this.product_description = product_description;
    this.department = department;
    this.price = price;
    this.quantity = quantity;
}

function CartItem(product, price, quantity, cost, department) {
    this.product = product;
    this.price = price;
    this.quantity = quantity;
    this.cost = cost;
    this.department = department;
}


var start = function() {
    inquirer.prompt({
        name: "usertype",
        type: "list",
        message: "Are you a new user or returning user",
        choices: ["NEW USER", "RETURNING USER"]
    }).then(function(answer) {
        if (answer.usertype === "NEW USER") {
            createNewUser();
        } else {
            inquirer.prompt([{
                name: "user",
                type: "input",
                message: "USERNAME:"
            }, {
                name: "pass",
                type: "password",
                message: "PASSWORD (case sensitive):"
            }]).then(function(answer) {
                currentUser = answer.user;
                password = answer.pass;
                verifyReturningUser();
            });
        }
    });
}
start();

function verifyReturningUser() {
    connection.query("SELECT username, password FROM bamazon.useraccounts WHERE username='" + currentUser + "' AND password='" + password + "';", function(err, res) {
        if (err) throw err;
        if (res == "") {
            console.log("\nINVALID USERNAME/PASSWORD COMBINATION\n");
            setTimeout(start, 1500);
        } else {
            console.log("\nverifying...");
            setTimeout(function() { console.log("\n\n WELCOME TO BAMAZON " + currentUser) }, 2000);
            setTimeout(mainMenu, 3000);
        }
        connection.query("UPDATE bamazon.useraccounts SET last_login='" + moment().format('MMMM Do YYYY, h:mm:ss a') + "' WHERE username='" + currentUser + "';", function(err, res) {
            if (err) throw err;

        });
        connection.query("SELECT account_balance FROM bamazon_user_management." + currentUser + ";", function(err, res) {

            if (err) throw err;
            var n = res.length;
            for (var i = 0; i < n; i++) {
                accountBalance = res[i].account_balance;
            }


        });

    });

}

function createNewUser() {
    inquirer.prompt([{
        name: "user",
        type: "input",
        message: "USERNAME:"
    }, {
        name: "pass",
        type: "password",
        message: "PASSWORD (case sensitive):"
    }, {
        name: "passconfirm",
        type: "password",
        message: "CONFIRM PASSWORD:"
    }]).then(function(answer) {
        currentUser = answer.user;
        password = answer.pass;
        if (password != answer.passconfirm) {
            console.log("\nPASSWORDS DO NOT MATCH, TRY AGAIN\n");
            setTimeout(createNewUser, 1000);
        } else if (password.includes(";") || password.includes(")")) {
            console.log("\nPASSWORD CAN'T CONTAIN THE CHARACTERS ';' OR ')', TRY AGAIN\n");
            setTimeout(createNewUser, 1000);
        } else if (password.length > 12) {
            console.log("\nPASSWORD LENGTH MUST BE LESS THAN 12 CHAARCTERS, TRY AGAIN\n");
            setTimeout(createNewUser, 1000);
        } else {
            newUserConfirmed();
        }
    })
}

function newUserConfirmed() {
    setTimeout(function() {
        console.log("\nYOUR ACCOUNT HAS BEEN SUCCESSFULLY CREATED\n\n WELCOME TO BAMAZON " + currentUser + "\n\n");
        mainMenu();
    }, 1000);

    connection.query("INSERT INTO bamazon.useraccounts SET ?", {
        username: currentUser,
        password: password,
        account_created: moment(),
        last_login: moment().format('MMMM Do YYYY, h:mm:ss a')
    }, function(err, res) {
        if (err) throw err;

    });

    connection.query("CREATE TABLE bamazon_user_management." + currentUser + " (id INTEGER(10) NOT NULL AUTO_INCREMENT PRIMARY KEY, account_balance DECIMAL(8, 2), purchase VARCHAR(100), quantity INTEGER(5), department VARCHAR(50), purchase_date VARCHAR(100), cost DECIMAL(8, 2));",
        function(err, res) {
            if (err) throw err;

        });

    connection.query("INSERT INTO bamazon_user_management." + currentUser + " SET ?", {
        account_balance: 2000,
    }, function(err, res) {
        if (err) throw err;
    });
    accountBalance = 2000;
}

function mainMenu() {
    connection.query("SELECT * FROM bamazon.products;",
        function(err, res) {
            if (err) throw err;
            var n = res.length;
            for (var i = 0; i < n; i++) {
                var productObj = new Product(res[i].id, res[i].product, res[i].product_description, res[i].department, res[i].price, res[i].quantity);
                productsArray.push(productObj);
                productsIdArray.push(i + 1);
            }

        });
    inquirer.prompt({
        name: "mainmenu",
        type: "list",
        message: "MAIN MENU:",
        choices: ["CHECK ACCOUNT BALANCE", "VIEW PURCHASE HISTORY", "SHOP", "ADD MONEY TO ACCOUNT"]
    }).then(function(answer) {
        console.log(answer.mainmenu);
        switch (answer.mainmenu) {
            case "CHECK ACCOUNT BALANCE":
                console.log("hello");
                break;
            case "VIEW PURCHASE HISTORY":
                console.log("hello");
                afsadf
                break;
            case "SHOP":
                browse();
                break;
            case "ADD MONEY TO ACCOUNT":
                console.log("hello");
                break;
        }
    });
}

function browse() {
    var n = productsArray.length;
    console.log(
        ` ID      PRODUCT      PRICE     DEPARTMENT     QUANTITY
----------------------------------------------------------------------- `
    );
    for (var i = 0; i < n; i++) {
        console.log(
            ` ${productsArray[i].id}    ${productsArray[i].product}      ${productsArray[i].price}         ${productsArray[i].department}          ${productsArray[i].quantity} \n\n`
        );

    }
    inquirer.prompt([{
        name: "shopping",
        type: "input",
        message: "INPUT THE ID OF THE PRODUCT YOU WISH TO PURCHASE"
    }, {
        name: "quantity",
        type: "input",
        message: "ENTER YOUR DESIRED QUANTITY",
    }]).then(function(answer) {
        cost = (productsArray[parseInt(answer.shopping) - 1].price) * parseInt(answer.quantity);
        var cartObj = new CartItem(productsArray[parseInt(answer.shopping) - 1].product, productsArray[parseInt(answer.shopping) - 1].price, parseInt(answer.quantity), cost = (productsArray[parseInt(answer.shopping) - 1].price) * parseInt(answer.quantity), productsArray[parseInt(answer.shopping) - 1].department);
        shoppingCartArray.push(cartObj);

        displayShoppingCart();


    });
}

function displayShoppingCart() {

    inquirer.prompt({
        name: "shop",
        type: "confirm",
        message: "Would you like to continue shopping?"
    }).then(function(answer) {
        if (answer.shop) {
            browse();
        } else {
            console.log(
                `\n\n    PRODUCT                       PRICE    QUANTITY        TOTAL
--------------------------------------------------------------------------------------- `
            );
            var n = shoppingCartArray.length;
            for (var i = 0; i < n; i++) {
                accountBalance -= cost;
                connection.query("INSERT INTO bamazon_user_management." + currentUser + " SET ?", {
                    account_balance: accountBalance,
                    purchase: shoppingCartArray[i].product,
                    quantity: shoppingCartArray[i].quantity,
                    department: shoppingCartArray[i].department,
                    purchase_date: moment().format('MMMM Do YYYY, h:mm:ss a'),
                    cost: shoppingCartArray[i].cost
                }, function(err, res) {
                    if (err) throw err;
                });
                totalOrderCost += shoppingCartArray[i].cost;
                console.log(
                    ` \n  ${shoppingCartArray[i].product}             $${shoppingCartArray[i].price}      ${shoppingCartArray[i].quantity}          $${shoppingCartArray[i].cost}`
                );

            }

            console.log(
                `\n                                           
---------------------------------------------------------------------------------------
                                       TOTAL ORDER COST:  $${totalOrderCost} `
            );

        }

    });
}
