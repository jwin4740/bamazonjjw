// NPM dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");
var $ = require("jquery");
var Table = require("tty-table");
var chalk = require("chalk");
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
    password: "platinum"
});

// constructor function for products
function Product(id, product, price, department, quantity) {
    this.id = id;
    this.product = product;
    this.price = price;
    this.department = department;

    this.quantity = quantity;
}

function CartItem(product, price, quantity, cost, department) {
    this.product = product;
    this.price = price;
    this.quantity = quantity;
    this.cost = cost;
    this.department = department;
}

var chalk = require('chalk');

// var header = [{
//     value: "DEPARTMENT",
//     headerColor: "cyan",
//     color: "white",
//     align: "left",
//     paddingLeft: 5,
//     width: 25
// }, {
//     value: "PRICE",
//     headerColor: "cyan",
//     color: "green",
//     width: 10,
//     formatter: function(value) {
//         var str = "$" + value.toFixed(2);
//         return str;
//     }
// }, {
//     value: "PRODUCT",
//     headerColor: "cyan",
//     color: "blue",
//     align: "left",
//     paddingLeft: 5,
//     width: 30
// }];

// //Example with arrays as rows 
// var rows = [
//     ["hamburger", 2.50, "no"],
//     ["el jefe's special cream sauce", 0.10, "yes"],
//     ["two tacos, rice and beans topped with cheddar cheese", 9.80, "no"],
//     ["apple slices", 1.00, "yes"],
//     ["ham sandwich", 1.50, "no"],
//     ["macaroni, ham and peruvian mozzarella", 3.75, "no"]
// ];


// var t1 = Table(header, rows, {
//     borderStyle: 1,
//     borderColor: "blue",
//     paddingBottom: 0,
//     headerAlign: "center",
//     align: "center",
//     color: "white"
// });

// str1 = t1.render();
// console.log(str1);






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
start();

function verifyReturningUser() {
    connection.query("SELECT username, password FROM bamazon.useraccounts WHERE username='" + currentUser + "' AND password='" + password + "';", function(err, res) {
        if (err) throw err;
        else if (res == "") {
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

    connection.query("CREATE TABLE bamazon_user_management." + currentUser + " (id INTEGER(10) NOT NULL AUTO_INCREMENT PRIMARY KEY, cost DECIMAL(8, 2), purchase VARCHAR(100), quantity INTEGER(5), department VARCHAR(50), purchase_date VARCHAR(100), account_balance DECIMAL(8, 2));",
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
                var productObj = new Product(res[i].id, res[i].product, res[i].price, res[i].department, res[i].quantity);
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

    // var n = productsArray.length;

    var header = [{
        value: "ID",
        headerColor: "cyan",
        color: "white",
        align: "center",
        width: 7
    }, {
        value: "PRODUCT",
        headerColor: "cyan",
        color: "green",
        align: "left",
        paddingLeft: 2,
        width: 35

    }, {
        value: "PRICE",
        headerColor: "cyan",
        color: "green",
        align: "center",
        width: 15,
        formatter: function(value) {
            var str = "$" + value.toFixed(2);
            return str;
        }
    }, {
        value: "DEPARTMENT",
        headerColor: "cyan",
        color: "yellow",
        align: "center",
        width: 20
    }, {
        value: "QUANTITY",
        headerColor: "cyan",
        color: "green",
        align: "center",
        width: 20
    }];

    //Example with arrays as rows 
    var rows = [];
    var n = productsArray.length;
    var x = 0;
    do {
        rows.push([productsArray[x].id, productsArray[x].product, productsArray[x].price, productsArray[x].department, productsArray[x].quantity]);
        x++;
    }
    while (x < n);

    var t1 = Table(header, rows, {
        borderStyle: 1,
        borderColor: "blue",
        paddingBottom: 0,
        headerAlign: "center",
        align: "center",
        color: "white"
    });

    str1 = t1.render();
    console.log(str1);


    //     console.log(
    //         ` ID      PRODUCT      PRICE     DEPARTMENT     QUANTITY
    // ----------------------------------------------------------------------- `
    //     );
    //     for (var i = 0; i < n; i++) {
    //         console.log(
    //             ` ${productsArray[i].id}    ${productsArray[i].product}      ${productsArray[i].price}         ${productsArray[i].department}          ${productsArray[i].quantity} \n\n`
    //         );

    //     }
    inquirer.prompt([{
        name: "shopping",
        type: "input",
        message: "INPUT THE ID OF THE PRODUCT YOU WISH TO PURCHASE"
    }, {
        name: "quantity",
        type: "input",
        message: "ENTER YOUR DESIRED QUANTITY",
    }]).then(function(answer) {
        newQuant = productsArray[parseInt(answer.shopping) - 1].quantity - parseInt(answer.quantity);
        if (newQuant <= 0) {
            console.log("INSUFFICIENT QUANTITY, PLEASE TRY AGAIN");
            browse();
        }
        cost = (productsArray[parseInt(answer.shopping) - 1].price) * parseInt(answer.quantity);
        var cartObj = new CartItem(productsArray[parseInt(answer.shopping) - 1].product, productsArray[parseInt(answer.shopping) - 1].price, parseInt(answer.quantity), cost = (productsArray[parseInt(answer.shopping) - 1].price) * parseInt(answer.quantity), productsArray[parseInt(answer.shopping) - 1].department);
        shoppingCartArray.push(cartObj);
        connection.query("UPDATE bamazon.products SET quantity=" + newQuant + " WHERE id=" + parseInt(answer.shopping) + ";", function(err, res) {
            if (err) throw err;

        });
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

            // var header = [{
            //        value: "PRODUCT",
            //        headerColor: "cyan",
            //        color: "white",
            //        align: "center",
            //        width: 7
            //    }, {
            //        value: "PRICE",
            //        headerColor: "cyan",
            //        color: "green",
            //        align: "left",
            //        paddingLeft: 2,
            //        width: 35,
            //        formatter: function(value) {
            //            var str = "$" + value.toFixed(2);
            //            return str;
            //        }

            //    }, {
            //        value: "QUANTITY",
            //        headerColor: "cyan",
            //        color: "green",
            //        align: "center",
            //        width: 15,

            //    }, {
            //        value: "TOTAL",
            //        headerColor: "cyan",
            //        color: "yellow",
            //        align: "center",
            //        width: 20
            //    }];

            //    //Example with arrays as rows 
            //    var rows = [];
            //    var n = productsArray.length;
            //    var x = 0;
            //    do {
            //        rows.push([productsArray[x].id, productsArray[x].product, productsArray[x].price, productsArray[x].department, productsArray[x].quantity]);
            //        x++;
            //    }
            //    while (x < n);

            //    var t1 = Table(header, rows, {
            //        borderStyle: 1,
            //        borderColor: "blue",
            //        paddingBottom: 0,
            //        headerAlign: "center",
            //        align: "center",
            //        color: "white"
            //    });

            //    str1 = t1.render();
            //    console.log(str1);









            var n = shoppingCartArray.length;




            for (var i = 0; i < n; i++) {
                cost = shoppingCartArray[i].cost;
                accountBalance -= cost;
                connection.query("INSERT INTO bamazon.transactions SET ?", {
                    username: currentUser,
                    purchase: shoppingCartArray[i].product,
                    quantity: shoppingCartArray[i].quantity,
                    department: shoppingCartArray[i].department,
                    purchase_date: moment().format('MMMM Do YYYY, h:mm:ss a'),
                    cost: shoppingCartArray[i].cost
                }, function(err, res) {
                    if (err) throw err;
                });
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
        setTimeout(mainMenu, 1500);
    });
}
