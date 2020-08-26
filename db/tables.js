
const Sequelize = require('sequelize');
const sequelize = require('./server.js');

const queries = [
    {
        table: 'users', 
        layout: `id INT PRIMARY KEY AUTO_INCREMENT, 
                username VARCHAR(100) UNIQUE NOT NULL, 
                fullname VARCHAR(255) NOT NULL, 
                email VARCHAR(255) UNIQUE NOT NULL, 
                password VARCHAR(100) NOT NULL, 
                address VARCHAR(255) NOT NULL, 
                admin BOOLEAN NOT NULL, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
    },
    {
        table: 'products',
        layout: `id INT PRIMARY KEY AUTO_INCREMENT, 
                product_name VARCHAR(100) UNIQUE NOT NULL, 
                description TINYTEXT, price INT`
    },
    {
        table:'orders',
        layout: `id INT PRIMARY KEY AUTO_INCREMENT, 
                user_id INT NOT NULL, 
                price INT NOT NULL, status VARCHAR(100), 
                payment VARCHAR(10), 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
    },
    {
        table:'order_items',
        layout: `order_id INT NOT NULL, 
                product_id INT NOT NULL, 
                quantity INT NOT NULL`
    }
]
// Create database tables
// loops the array with the query for each table 
queries.forEach(query => {
    sequelize.query(`CREATE TABLE ${query.table} (${query.layout})`, 
        {raw: true}
    ).then ((response) => {
        console.log(`Table ${query.table} created`);
    }).catch((err) => {
        console.log(err);
    })
})

