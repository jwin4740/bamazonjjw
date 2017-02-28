var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "platinum",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id" + connection.threadId);
});

// select entire table
connection.query("SELECT * FROM products", function (err, res){
	if(err) throw err;
	console.log(res);
});
