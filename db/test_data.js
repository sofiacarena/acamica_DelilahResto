// queries to create products and order

const Sequelize = require('sequelize');
const sequelize = require('../server.js');

// 4 products data
const products = [
    {
        product_name: "Hamburguesa Doble", 
        description: "",
        price: 250
    },
    {
        product_name: "Hamburguesa Simple", 
        description: "",
        price: 190
    },
    {
        product_name: "Papas Fritas", 
        description: "",
        price: 150
    },
    {
        product_name: "Cerveza Tirada", 
        description: "",
        price: 90
    }
]

// loops the array with the replacements for each product 
products.forEach( product => {
    sequelize.query(`INSERT INTO products (product_name, description, price) VALUES (?, ?, ?)`, 
        {replacements: [product.product_name, product.description, product.price], raw: true}
    ).then ((response) => {
        console.log(`Product ${product.product_name} created`);
    }).catch((err) => {
        console.log(err);
    });
});


// Creates order
sequelize.query('SELECT * FROM products WHERE id = ?',
    {replacements: [1], type: sequelize.QueryTypes.SELECT, raw: true }
).then((response) => {
    sequelize.query('INSERT INTO orders (user_id, price, status, payment) VALUES (?, ?, ?, ?)',
        {replacements: [ 1, response[0].price, "nuevo", "cash"]});
    sequelize.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
        {replacements: [1, response[0].id, 1]}); 
    console.log("Order made succesfully");
});