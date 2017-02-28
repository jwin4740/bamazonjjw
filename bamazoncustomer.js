var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");
var $ = require("jquery");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "platinum",
    database: "bamazon"
});

// connection.connect(function(err) {
//     if (err) throw err;
//     console.log("connected as id" + connection.threadId);
// });

// // select entire table
// connection.query("SELECT * FROM products", function (err, res){
// 	if(err) throw err;
// 	console.log(res);
// });

var currentUser;
var password;
// var tester = $(jquery.isEmptyObject({}));
// console.log(tester);
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
    connection.query("SELECT username, password FROM useraccounts WHERE username='" + currentUser + "' AND password='" + password + "';", function(err, res) {
        if (err) throw err;
        if (res == "") {
            console.log("\nINVALID USERNAME/PASSWORD COMBINATION\n");
            setTimeout(start, 1500);
        } else {
            console.log("\nverifying...");
            setTimeout(function() { console.log("\n WELCOME TO BAMAZON " + currentUser) }, 2000);
        }
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
    }]).then(function(answer) {
        currentUser = answer.user;
        password = answer.pass;
        console.log(currentUser + "\n" + password);
        connection.query("INSERT INTO useraccounts SET ?", {
            username: currentUser,
            password: password,
            last_login: moment()
        }, function(err, res) {
            if (err) throw err;
            console.log(res);
        });

        connection.query("CREATE TABLE " + currentUser + " (id INTEGER(10) NOT NULL AUTO_INCREMENT PRIMARY KEY, account_balance DECIMAL(8, 2), purchase VARCHAR(100), purchase_date VARCHAR(100), cost DECIMAL(8, 2));",
            function(err, res) {
                if (err) throw err;
                console.log(res);
            });

        connection.query("INSERT INTO " + currentUser + " SET ?", {
            account_balance: 1000,
            purchase: "iphone",
            purchase_date: "today",
            cost: 250
        }, function(err, res) {
            if (err) throw err;
            console.log(res);
        });



    })
}
