// NPM dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");
var $ = require("jquery");

// global variables
var currentUser;
var password;
var productsArray = [];


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


var start = function() {
    inquirer.prompt({
        name: "usertype",
        type: "list",
        message: "Are you a new user or returning user",
        choices: ["newuser", "returninguser"]
    }).then(function(answer) {
        if (answer.usertype === "newuser") {
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
            setTimeout(shopping, 3000);
        }
        connection.query("UPDATE bamazon.useraccounts SET last_login='" + moment().format('llll') + "' WHERE username='" + currentUser + "';", function(err, res) {
            if (err) throw err;

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

        if (answer.pass === answer.passconfirm) {
            currentUser = answer.user;
            password = answer.pass;
            newUserConfirmed();
        } else {
            console.log("\nPASSWORDS DO NOT MATCH, TRY AGAIN\n");
            setTimeout(createNewUser, 1000);
        }
    })
}

function newUserConfirmed() {
    setTimeout(function() { console.log("\nYOUR ACCOUNT HAS BEEN SUCCESSFULLY CREATED\n\n WELCOME TO BAMAZON " + currentUser); }, 1000);

    connection.query("INSERT INTO bamazon.useraccounts SET ?", {
        username: currentUser,
        password: password,
        account_created: moment(),
        last_login: moment().format('llll')
    }, function(err, res) {
        if (err) throw err;

    });

    connection.query("CREATE TABLE bamazon_user_management." + currentUser + " (id INTEGER(10) NOT NULL AUTO_INCREMENT PRIMARY KEY, account_balance DECIMAL(8, 2), purchase VARCHAR(100), purchase_date VARCHAR(100), cost DECIMAL(8, 2));",
        function(err, res) {
            if (err) throw err;

        });

    connection.query("INSERT INTO bamazon_user_management." + currentUser + " SET ?", {
        account_balance: 1000,
        purchase: "iphone",
        purchase_date: moment.format('LL'),
        cost: 250
    }, function(err, res) {
        if (err) throw err;
    });
}

function shopping() {
    connection.query("SELECT * FROM bamazon.products;",
        function(err, res) {
            if (err) throw err;
            var n = res.length;
            for (var i = 0; i < n; i++) {
                var productObj = new Product(res[i].id, res[i].product, res[i].product_description, res[i].department, res[i].price, res[i].quantity);
            	productsArray.push(productObj);
            }
            console.log(productsArray);
        });
}
