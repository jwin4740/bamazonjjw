const mysql = require("mysql");
const inquirer = require("inquirer");
const moment = require("moment");
const $ = require("jquery");
const Table = require("tty-table");
const chalk = require("chalk");

var currentUser;
var password;
var productsArray = [];
var productsIdArray = [];
var shoppingCartArray = [];
var cost = 0;
var totalOrderCost = 0;
var accountBalance = 0;
var departmentArray = [];
var departmentTotalsArray = [];
var m = 0;
var tempSum;



exports.start = function() {
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
                    console.log(departmentTotalsArray);
                    password = answer.pass;
                    currentUser = answer.user;
                    if (password.includes(";") || password.includes(")")) {
                        console.log("\nPASSWORD CAN'T CONTAIN THE CHARACTERS ';' OR ')', TRY AGAIN\n");
                        setTimeout(start, 1000);
                    } else if (password.length > 12) {
                        console.log("\nPASSWORD LENGTH MUST BE LESS THAN 12 CHARACTERS, TRY AGAIN\n");
                        setTimeout(start, 1000);
                    } else {
                        verifyReturningUser();
                    }
                });
            }
        });
    }