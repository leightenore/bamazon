//Global Variables
//==================================================================================================================

const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});


//Functions
//==================================================================================================================

//Loops through products table in database and displays item id, product, and price
function displayProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log("Item ID: " + res[i].item_id + "\nProduct: " + res[i].product_name + "\nPrice: $" + res[i].price + "\n--------------------------------------");
        }
    });
    itemSelection();
}


//Prompts user to select an item to purchase
function itemSelection() {
    connection.query("SELECT item_id FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "idNumber",
                type: "input",
                message: "Please enter the ID Number of the item you would like to purchase:",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
            .then(function (answer) {
                let item;
                item = answer.idNumber;
                itemQuantity(item);
            });
    });
}


//Prompts user to select the quanity that they would like to purchase
//If the order is successful, the quantity is updated in the database. If there is not enough of the item in inventory, the user is prompted to enter a lower amount
function itemQuantity(id) {
    connection.query("SELECT stock_quantity, price FROM products WHERE ?", { item_id: id }, function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "quantity",
                type: "input",
                message: "Please enter the quantity of this product that you would like to purchase:",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
            .then(function (answer) {
                if (parseInt(answer.quantity) <= res[0].stock_quantity) {
                    var total = answer.quantity * parseFloat(res[0].price);
                    console.log("Your total is: $" + total.toFixed(2) + "\nThank you for your purchase!");

                    var newQuantity = res[0].stock_quantity - parseInt(answer.quantity);

                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newQuantity
                            },
                            {
                                item_id: id
                            }
                        ],
                        function (err, res) {
                            if (err) throw err;
                            console.log("Your items has been removed from inventory. Your order is on it's way!");
                            connection.end();
                        });
                }
                else {
                    console.log("We do not have enough items in inventory to fulfill your order. Please decrease the quantity of your order to proceed.");
                    itemQuantity(id);
                }
            });
    });
}


//Main Process
//==================================================================================================================

connection.connect(function (err, res) {
    if (err) throw err;
    displayProducts();
});