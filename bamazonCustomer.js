let mysql = require("mysql");
let prompt = require("prompt");
let inquirer = require("inquirer");
let Table = require("cli-table-redemption");
let chalk = require("chalk");

let productsPurchased = [];

let connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Jose103115!",
    database:"bamazon"
});

connection.connect();

connection.query('SELECT item_id, product_name, department_name, price, stock_quantity FROM products', function (error, resultsults) {
    if (error) console.log("ERROR HERE ------" + error);

    var table = new Table({
        head: ['Item ID','Product Name','Department','Price','In Stock'],
        colWidths: [10, 25, 20, 10, 10],
        chars: {
            'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗',
            'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝',
            'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼',
            'right': '║' , 'right-mid': '╢' , 'middle': '│'
          }
    
    });

    for(var tableIndex = 0; tableIndex < resultsults.length; tableIndex++){
        table.push(
            [chalk.whiteBright.bold(resultsults[tableIndex].item_id), chalk.cyan.bold(resultsults[tableIndex].product_name), chalk.cyan.bold(resultsults[tableIndex].department_name), chalk.cyan.bold(resultsults[tableIndex].price), chalk.cyan.bold(resultsults[tableIndex].stock_quantity)]
        );
    }
    console.log(table.toString());
    purchase();
  });

  let purchase = () => {
    inquirer.prompt([{
        type: "input",
        name: "item_id",
        message: chalk.green("Enter the ID of the product you would like to purchase."),
    },
    {
        type: "input",
        name: "quantity",
        message: chalk.green("In what quantity?")
    }
    ]).then(function(customerPurchase){
        connection.query("SELECT * FROM products WHERE item_id=?", customerPurchase.item_id, function(err,res){
            for(let purchIndex = 0; purchIndex < res.length; purchIndex++){
                if(customerPurchase.quantity > res[purchIndex].stock_quantity){
                    console.log(chalk.red("-------------------------------------"));
                    console.log(chalk.red(" Sorry, that product is out of stock!"));
                    console.log(chalk.red("-----Try a different quantity--------"))
                    console.log(chalk.red("-------------------------------------")); 
                    purchase();
                }
                else {
                    console.log(chalk.yellow("You have selected: " + res[purchIndex].product_name));
                    console.log(chalk.yellow("Price: $" + res[purchIndex].price));
                    console.log(chalk.yellow("Quantity: " + customerPurchase.quantity));
                    console.log(chalk.yellow("Total: $" + res[purchIndex].price * customerPurchase.quantity));


                    var newStock = (res[purchIndex].stock_quantity - customerPurchase.quantity);
                    console.log(chalk.cyan(res[purchIndex].stock_quantity - customerPurchase.quantity));
                    console.log(newStock);
                    let purchaseID = (customerPurchase.item_id);
                    confirmPurchase(newStock);
                };
            }
        });
    });
    let confirmPurchase = () => {
        inquirer.prompt([{
            type:"confirm",
            name:"confirmPurchase",
            message:"Are you sure you want to confirm this purchase?",
            default: true
        }]).then(function(userConfirmation){
            if(userConfirmation.confirmPurchase === true){
                connection.query("UPDATE products SET stock_quantity WHERE item_id = ",[{
                    stock_quantity: newStock,
                },{
                    item_id:purchaseID
                }], function(err,res){});
                
                console.log("Your order has been processed. Thank you for shopping with us!")
            }else{
                console.log("We experienced techinical difficulties please try again.")
                purchase();
            }
            
        });
    };
};


/*    let productsInfo = {
        properties: {
            item_id:{description: chalk.green("Enter the ID of the product you want to purchase.")},
            quantity:{description: chalk.green("How many items would you like?")}        
        },
      };
  prompt.start();
  prompt.get(productsInfo, function(err, results){
      let customerPurchase = {
        item_id: results.item_id,
        quantity: results.quantity,
      };
      console.log(customerPurchase);
      productsPurchased.push(customerPurchase);
      console.log(customerPurchase);
      connection.query('SELECT * FROM products WHERE item_id=?', customerPurchase.item_id, function(err,results){
          console.log(customerPurchase);
          if (err) console.log("ERROR HERE---------" + err);

          if(results[0].stock_quantity < customerPurchase[0].quantity){
              console.log('Sorry. That product is out of stock.');
              connection.end();
          }
          else if(results[0].stock_quantity >= customerPurchase[0].quantity){
              console.log(customerPurchase[0].quantity + 'items purchased.');
              console.log(results[0].product_name + ' ' + results[0].price);

              let salesTotal = results[0].price * customerPurchase[0].quantity;
              connection.query("UPDATE Departments SET TotalSales = ? WHERE DepartmentName = ?;", [saleTotal, results[0].DepartmentName], function(err, resultsultOne){
                if(err) console.log('error: ' + err);
                return resultsultOne;
            })  
          }
      })
    console.log('Total:' + salesTotal);
  });
  };
*/
