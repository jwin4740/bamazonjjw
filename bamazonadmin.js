// NPM dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");
var Table = require("tty-table");
var chalk = require("chalk");
// global variables
var userType;
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




var start = function() {
    inquirer.prompt({
        name: "usertype",
        type: "list",
        message: "Are you a branch manager or corporate",
        choices: ["MANAGER", "CORPORATE"]
    }).then(function(response) {
        userType = response.usertype;
        if (userType === "CORPORATE") {
            console.log(userType);
        }
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
    });
}
start();

function verifyReturningUser() {
    connection.query("SELECT username, password FROM bamazon.adminaccounts WHERE username='" + currentUser + "' AND password='" + password + "';", function(err, res) {
        if (err) throw err;
        else if (res == "") {
            console.log("\nINVALID USERNAME/PASSWORD COMBINATION\n");
            setTimeout(start, 1500);
        } else {
            console.log("\nverifying...");
            setTimeout(function() { console.log("\n\n WELCOME TO BAMAZON " + currentUser) }, 2000);
            setTimeout(mainMenu, 3000);
        }
        connection.query("UPDATE bamazon.adminaccounts SET last_login='" + moment().format('MMMM Do YYYY, h:mm:ss a') + "' WHERE username='" + currentUser + "';", function(err, res) {
            if (err) throw err;

        });
    });

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
        name: "adminmenu",
        type: "list",
        message: "ADMIN MENU:",
        choices: [
            "VIEW PRODUCTS",
            "VIEW LOW INVENTORY",
            "ADD TO INVENTORY",
            "ADD NEW PRODUCT",
            "VIEW PRODUCT SALES BY DEPARTMENT (corporate access only)",
            "CREATE A NEW DEPARTMENT (corporate access only)",
            "GENERATE STRATEGY REPORT (corporate access only)"
        ]
    }).then(function(answer) {
        switch (answer.adminmenu) {
            case "VIEW PRODUCTS":
                checkInventory(999);
                break;
            case "VIEW LOW INVENTORY":
                checkInventory(5);
                break;
            case "ADD TO INVENTORY":
                addInventory();
                break;
            case "ADD NEW PRODUCT":
                addProducts();
                break;
            case "VIEW PRODUCT SALES BY DEPARTMENT (corporate access only)":
                viewDepartmentSales();
                break;
            case "CREATE A NEW DEPARTMENT (corporate access only)":
                createNewDepartment();
                break;
            case "GENERATE STRATEGY REPORT (corporate access only)":
                generateStrategy();
                break;
        }
    });
}


function checkInventory(y) {
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
        if (productsArray[x].quantity < y) {
            rows.push([productsArray[x].id, productsArray[x].product, productsArray[x].price, productsArray[x].department, productsArray[x].quantity]);
        }
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
    console.log("hello");
}

function addInventory() {
    connection.query("UPDATE bamazon.products SET quantity=" + newQuant + " WHERE id=" + parseInt(answer.shopping) + ";", function(err, res) {
            if (err) throw err;

        });
}

function addProducts() {
    console.log("hello");
}

function viewDepartmentSales() {
    console.log("hello");
}

function createNewDepartment() {
    console.log("hello");
}

function generateStrategy() {
    console.log("hello");
}
