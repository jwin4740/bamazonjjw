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
var newQuant;
var rows = [];
var departmentArray = [];
var m = 0;
var departmentTotalsArray = [];


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

// department object

function DepartmentTotal(bamdepartment, bamtotal) {
    this.bamdepartment = bamdepartment;
    this.bamtotal = bamtotal;
}


getSums();

function getSums() {

    connection.query("SELECT * FROM bamazon.departments;",
        function(err, res) {
            if (err) throw err;
            var n = res.length;
            for (var i = 0; i < n; i++) {
                var depTotalObj = new DepartmentTotal(res[i].department_name, res[i].total_department_sales);
                departmentTotalsArray.push(depTotalObj);
                departmentArray.push(res[i].department_name);

            }
        });

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
    rows = [];
    productsArray = [];
    productsIdArray = [];
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
    mainMenu();
}

function addInventory() {
    inquirer.prompt([{
        name: "inventory",
        type: "input",
        message: "INPUT THE ID OF THE PRODUCT YOU WISH TO UPDATE"
    }, {
        name: "quantity",
        type: "input",
        message: "WHAT QUANTITY DO YOU WANT TO SET THIS ITEM TO?",
    }]).then(function(answer) {
        newQuant = answer.quantity;
        connection.query("UPDATE bamazon.products SET quantity=" + newQuant + " WHERE id=" + parseInt(answer.inventory) + ";", function(err, res) {
            if (err) throw err;
            addMore();
        });
    });
}

function addMore() {
    inquirer.prompt([{
        name: "confirmation",
        type: "confirm",
        message: "WOULD YOU LIKE TO ADD MORE ITEMS TO INVENTORY?"
    }]).then(function(answer) {
        if (answer.confirmation === true) {
            addInventory();
        } else {
            console.log("items have been successfully added!!!");
            setTimeout(mainMenu, 1500);
        }
    });
}

function addProducts() {
    inquirer.prompt([{
        name: "product",
        type: "input",
        message: "INPUT YOUR PRODUCT"
    }, {
        name: "productdescription",
        type: "input",
        message: "PLEASE INPUT A PRODUCT DESCRIPTION?"
    }, {
        name: "department",
        type: "list",
        message: "WHAT DEPARTMENT?",
        choices: departmentArray
    }, {
        name: "price",
        type: "input",
        message: "WHAT PRICE DO YOU WANT TO SET THIS ITEM TO?"
    }, {
        name: "quantity",
        type: "input",
        message: "WHAT QUANTITY DO YOU WANT TO SET THIS ITEM TO?"
    }]).then(function(answer) {
        connection.query("INSERT INTO bamazon.products SET ?", {
            product: answer.product,
            product_description: answer.productdescription,
            department: answer.department,
            price: answer.price,
            quantity: answer.quantity
        }, function(err, res) {
            if (err) throw err;
            else {
                console.log("product successfully added!!")
                setTimeout(mainMenu, 1500);
            }
        });
    });
}

function viewDepartmentSales() {
    if (userType === "MANAGER") {
        console.log("\nI'M SORRY YOU DO NOT HAVE ACCESS TO THIS FUNCTION\n");
        setTimeout(mainMenu, 1500);
    } else {
        var n = departmentArray.length;
        for (var i = 0; i < n; i++) {
            connection.query("SELECT total_department_sales FROM bamazon.departments WHERE department_name='" + departmentArray[i] + "';", function(err, res) {
                if (err) throw err;
                else {
                    console.log(res);
                  
                }
            });

        }
        setTimeout(mainMenu, 1500);
    }
}

function createNewDepartment() {
    if (userType === "MANAGER") {
        console.log("\nI'M SORRY YOU DO NOT HAVE ACCESS TO THIS FUNCTION\n");
        setTimeout(mainMenu, 1500);
    } else {

        inquirer.prompt([{
            name: "department",
            type: "input",
            message: "WHAT IS THE NAME OF THE DEPARTMENT YOU WANT TO CREATE?"
        }, {
            name: "overhead",
            type: "input",
            message: "ENTER AN ESTIMATED OVERHEAD COST?"
        }]).then(function(answer) {
            connection.query("INSERT INTO bamazon.departments SET ?", {
                department_name: answer.department,
                over_head_costs: answer.overhead
            }, function(err, res) {
                if (err) throw err;
                else {
                    departmentArray.push(answer.department);
                    console.log("department successfully added!!")
                    setTimeout(mainMenu, 1500);
                }
            });
        });
    }
}


function generateStrategy() {
    if (userType === "MANAGER") {
        console.log("\nI'M SORRY YOU DO NOT HAVE ACCESS TO THIS FUNCTION\n");
        setTimeout(mainMenu, 1500);
    } else {
        console.log("THIS STRATEGY TEAM IS STILL PREPARING OUR REPORT, CHECK BACK LATER");
    }
}
