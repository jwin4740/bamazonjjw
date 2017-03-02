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


// creates connection to mysql
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "platinum",

});



// inquirer.prompt([{
//     name: "user",
//     type: "input",
//     message: "USERNAME:"
// }, {
//     name: "pass",
//     type: "password",
//     message: "PASSWORD (case sensitive):"
// }, {
//     name: "passconfirm",
//     type: "password",
//     message: "CONFIRM PASSWORD:"
// }]).then(function(answer) {

//     if (answer.pass === answer.passconfirm) {
//         currentUser = answer.user;
//         password = answer.pass;
//         tempFunction();
//     } else {
//         console.log("\nPASSWORDS DO NOT MATCH, TRY AGAIN\n");
//         setTimeout(tempFunction, 1000);
//     }
// });
var dropit = "test'; drop table bamazon.temp;";
console.log(dropit);
tempFunction();

function tempFunction() {
    connection.query("INSERT INTO bamazon.temp SET id ", function(err, res) {
        if (err) throw err;
        console.log(res);

    });
}
