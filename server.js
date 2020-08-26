// Added dependencies
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
const jwt = require('jsonwebtoken');

// Signing key for jsonwebtoken
const jwtKey = '123456';

const app = express();

// Applies body parser to all paths
app.use(bodyParser.json());

// Import connection to database constants
const DB = require('./config');

// Connection to db             
const sequelize = new Sequelize(`${DB.DIALECT}://${DB.USER}:${DB.PASSWORD}@${DB.HOST}:${DB.PORT}/${DB.NAME}`);

sequelize.authenticate().then(() => {
    console.log('Connection established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Handles server errors
function handleError(err, req, res, next) {
    if (!err) { next(); }
    res.status(500).send('An error has occurred. ' + err);
    console.log(`Error: ${err} en ${req.path} ${req.method}`)
}
// Applies middleware to handle server error to all paths
app.use(handleError);

// Verifies if the user is an admin
function adminAuth (req, res, next){
    try {
        // if the token is not sent in the header, throws an error
        if (!(req.headers.authorization)) { throw new Error ('Missing token. Need permissions') }
        // extracts the token from the header
        const token = req.headers.authorization.split(' ')[1];
        // verifies the token with the sign chose 
        const decodeToken = jwt.verify(token, jwtKey);
        // checks if the user is admin
        // when it is, allows the request to keep going
        if(decodeToken && decodeToken.admin === 1) { return next(); }
        else{ throw new Error ('Access denied') }
    } catch(err){
        res.status(403).json({ error: err.message });
    }
}

// Validates user session
function validateUser (req, res, next){
    try {
        // if the token is not sent in the header, throws an error
        if (!(req.headers.authorization)) { throw new Error ('Missing token. Need permissions') }
        // extracts the token from the header
        let token = req.headers.authorization.split(' ')[1];
        // verifies the token with the sign chose 
        decodeToken = jwt.verify(token, jwtKey);
        if(decodeToken){
            // sends the data contained in the token
            req.tokenData = decodeToken;
            next();
        }else{
            throw new Error ('You are not logged in');
        }
    } catch (err) {
        res.status(401).json({ error: err })
    }
}


// USER Endpoints

//  Create user
//  Admin is false in every insert 
app.post('/users', (req, res) => {
    const { username, fullname, email, password, address } = req.body;
    // checks if there´s a missing value, returns an error if there is
    if (!username || !fullname || !email || !password || !address){
        res.status(400);
        res.json({error: 'Missing obligatory fields'})
        return;
    }
    //checks that the same username or email isn´t already save
    sequelize.query('SELECT username, email FROM users WHERE username = ? OR email = ?',
        {replacements: [username, email], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) => {
        if (response.length != 0) { 
            throw new Error ('Username or email already exist') 
        }
        // creates the user in db with the values sent in the body of the request
        // admin is always false
        sequelize.query('INSERT INTO users (username, fullname, email, password, address, admin) VALUES (?, ?, ?, ?, ?, ?)',
            {replacements: [username, fullname, email, password, address, false]})
        .then((response) => {
            res.status(201).json({ message: `User ${username} created successfully`,
                user: {username: username, fullname: fullname, email: email, address: address}});
        })
    }).catch (function (err) {
        res.status(409).json({ error: err.message});
    }); 
});
//  Login user
app.post('/login', (req, res) => {
    const { username, email, password } = req.body;
    // checks if there´s a missing value, returns an error if there is
    if (!password || (!username && !password) || (!email && !password)){
        res.status(400);
        res.json({ error: 'Missing obligatory fields' });
        return;
    }
    // searches by username or email all user information
    sequelize.query('SELECT * FROM users WHERE username = ? OR email = ?',
        {replacements: [username, email], type: sequelize.QueryTypes.SELECT }
    ).then((response) => {
        //checks if the found info and the submitted are the same
        //when they are, responds a token with the user id, username and admin info gotten from the select query
        if (response.length == 0){
            throw err;
        } 
        if (response[0].password == password) {
            let payload = {
                id: response[0].id,
                username: response[0].username,
                admin: response[0].admin
            }
            res.status(200);
            // produces the token with jwt
            const token = jwt.sign(payload, jwtKey);
            // responds the token formed
            res.json({ token });
        } else {
            throw err;
        }
    }).catch (function (err) {
        res.status(401).json({ error: 'Login failed: Incorrect username, email or password' });
    });
});
//  Gets all users if the user making the request is an admin
app.get('/users', adminAuth, (req, res) => {
    sequelize.query('SELECT id, username, fullname, email, address, created_at FROM users',
        { type: sequelize.QueryTypes.SELECT }
    ).then((response) => {
        res.status(200).json(response);
    })
})

// PRODUCTS Endpoints

//  Create product 
app.post('/products', adminAuth, (req, res) => {
    const { product_name, description, price } = req.body;
    // checks if there´s a missing value, returns an error if there is
    if (!product_name || !price) {
        res.status(400);
        res.json({ error: 'Missing obligatory fields' })
        return;
    }
    //searches product by the product name sent in the request
    sequelize.query('SELECT product_name FROM products WHERE product_name = ?',
        {replacements: [product_name], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) => {
        //checks for the content of response
        //if response is not empty means a product by the product name is already saved
        if (response.length != 0) { 
            throw new Error ('Product already exist') 
        }
        //creates the product in db with the values sent in the body of the request
        sequelize.query('INSERT INTO products (product_name, description, price) VALUES (?, ?, ?)',
            {replacements: [product_name, description, price]})
        .then(() => {
            res.status(201).json({ message: `Product ${product_name} created successfully`,
                product: {product_name: product_name, description: description, price: price}});
        });
    }).catch (function (err) {
        res.status(409).json({ error: err.message});
    });
});
//  Get all products
app.get('/products', validateUser, (req, res) => {
    sequelize.query('SELECT * FROM products',
        { type: sequelize.QueryTypes.SELECT }
    ).then((response) => {
        res.status(200).json(response);
    });
});
//  Get product by id
app.get('/products/:id', validateUser, (req,res) => {
    //extracts id param from req
    let id = req.params.id;
    //search by the id sent in the request
    sequelize.query('SELECT * FROM products WHERE id = ?',
        {replacements: [id], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) => {
        //checks if the product by id sent in the request exists
        if (response.length == 0) { 
            throw new Error (`Product ${[response].id} couldn't be found`);
        }
        //when the product exists answers the one that was found
        res.status(200).json(response);
    }).catch (function (err) {
        res.status(404).json({ error: err.message});
    });
});
//  Edit product
app.put('/products/:id', adminAuth, (req, res) => {
    let id = req.params.id;
    let {product_name, description, price} = req.body;
    if (!product_name && !description && !price){
        // if nothing was sent in the body of the request, returns an error
        res.status(400).json({error: 'Missing required values'});
        return;
    }
    // checks the existence of the product by the id sent
    sequelize.query('SELECT * FROM products WHERE id = ?',
        {replacements: [id], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) =>{
        // if the product doesn´t exists, returns an error
        if (response.length == 0){
            res.status(404);
            throw new Error (`Product with id = ${id} could not be found`);
        }
        // when the product by id is found, makes the edition
        sequelize.query(`UPDATE products SET product_name = "${product_name}", description = "${description}", price = "${price}" WHERE id = ?`, 
            {replacements: [id]}
        ).then((response) => { 
            res.status(200).send('Product edited successfully')
        });
    }).catch(function(err){
        res.json({error: err.message});
    })
})
//  Delete product
app.delete('/products/:id', adminAuth, (req, res) => {
    let id = req.params.id;
    // checks if the product by id exists
    sequelize.query('SELECT * FROM products WHERE id = ?',
        {replacements: [id], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) =>{
        // if the product by id doesn´t exist, throws an error
        if (response.length == 0){
            res.status(404)
            throw new Error (`Product with id = ${id} could not be found`);
        }
        // when the product by id exits, gets deleted
        sequelize.query('DELETE FROM products WHERE id = ?',
            {replacements: [id]}
        ).then((response) => {
            res.status(204).json();
        });
    }).catch(function(err){
        res.json({error: err.message});
    });
});

// ORDERS Endpoints

//  Create Order
app.post('/orders', validateUser, (req, res) => {
    const {order, order_items} = req.body;
    // checks if the user with the id sent in the order exists
    sequelize.query('SELECT id FROM users WHERE id = ?',
        {replacements: [order.user_id], type: sequelize.QueryTypes.SELECT, raw: true}
    ).then( async function (response) {
        var price = 0;
        try {
            // if there´s no user with the id sent, throws a not found error
            if (response.length == 0){
                res.status(404)
                throw new Error (`User with id = ${order.user_id} could not be found`);
            }
            // when the user exists 
            await Promise.all(order_items.map(async (item) => {
                // gets the price of every item of the products table sent in order_items
                const [itemPrice] = await sequelize.query('SELECT price FROM products WHERE id = ?',
                {replacements: [item.product_id], type: sequelize.QueryTypes.SELECT, raw: true});
                // if any of the products by id can't be found throws an error
                if (!itemPrice){
                    res.status(404)
                    throw new Error (`Product with id = ${item.product_id} could not be found`);
                }
                // adds the price of each item multiplied by the quantity
                price = price + (itemPrice.price * item.quantity);
            }))
            // after the price of the whole order is obtained, creates the order
            sequelize.query('INSERT INTO orders (user_id, price, status, payment) VALUES (?, ?, ?, ?)',
                {replacements: [order.user_id, price, "nuevo", order.payment]}
            ).then((response) => {
                // creates a register for every ordered item
                order_items.forEach(item => {
                    sequelize.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
                    {replacements: [response[0], item.product_id, item.quantity]}); 
                });
                res.status(201).json({message: "Order made succesfully"});
            });
        } catch (err) {
            res.json({ error: err.message });
        }
    }); 
});
//  Get all orders for admin or all orders for user id
app.get('/orders', validateUser, (req, res) => {
    const tokenData = req.tokenData;
    // when the user logged in is an admin, returns all orders
    if (tokenData.admin == 1){
        sequelize.query('SELECT orders.*, users.fullname, users.address, GROUP_CONCAT(order_items.quantity, "x", products.product_name SEPARATOR " ") AS "items" FROM orders JOIN users ON orders.user_id = users.id JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id GROUP BY order_items.order_id',
            {type: sequelize.QueryTypes.SELECT, raw: true}
        ).then((response) => {
            res.status(200).json(response);
        }).catch(function (err){
            res.status(404).json({ error: err.message});
        });
    } 
    // when the user logged in is not an admin, returns all orders made by that user
    else if (tokenData.admin == 0){
        sequelize.query('SELECT orders.*, users.fullname, users.address, GROUP_CONCAT(order_items.quantity, "x", products.product_name SEPARATOR " ") AS "items" FROM orders JOIN users ON orders.user_id = users.id JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id WHERE orders.user_id = ? GROUP BY order_items.order_id',
            {replacements: [tokenData.id],type: sequelize.QueryTypes.SELECT, raw: true}
        ).then((response) => {
            res.status(200).json(response);
        }).catch(function (err){
            res.status(404).json({ error: err.message});
        })
    }
});
//  Get order by id 
app.get('/orders/:id', adminAuth, (req, res) => {
    const id = req.params.id;
    // searches order by the id sent in path
    sequelize.query('SELECT orders.*, users.fullname, users.address, GROUP_CONCAT(order_items.quantity, "x", products.product_name SEPARATOR " ") AS "items" FROM orders JOIN users ON orders.user_id = users.id JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id WHERE orders.id = ?',
        {replacements: [id], type: sequelize.QueryTypes.SELECT, raw: true}
    ).then(([response]) => {
        console.log(response);
        // if the order id can´t be found, throws error
        if(!(response.id)){
            res.status(404);
            throw new Error (`Order with id = ${id} could not be found`);
        }
        // when order exists, sends response
        res.status(200).send(response);
    }).catch(function (err){
        res.json({ error: err.message});
    });
});
//  Edit status of the order by order id
app.put('/orders/:id', adminAuth, (req, res) => {
    const id = req.params.id;
    const status = req.body;
    if (!status){
        // if nothing was sent in the body of the request, returns an error
        res.status(400).json({error: 'Missing required value'});
        return;
    }
    // checks the existence of the order by the id sent
    sequelize.query('SELECT * FROM orders WHERE id = ?',
        {replacements: [id], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) =>{
        // if the order doesn´t exists, returns an error
        if (response.length == 0){
            res.status(404);
            throw new Error (`Order ${id} could not be found`);
        }
        // when the order by id is found, makes the edition
        sequelize.query(`UPDATE orders SET status = "${status}" WHERE id = ?`, 
            {replacements: [id]}
        ).then((response) => { 
            res.status(200).send('Order status edited successfully');
        });
    }).catch(function(err){
        res.json({error: err.message});
    })
})
//  Delete order 
app.delete('/orders/:id', adminAuth, (req, res) => {
    const id = req.params.id;
    // checks if the order by id exists
    sequelize.query('SELECT * FROM orders WHERE id = ?',
        {replacements: [id], type: sequelize.QueryTypes.SELECT, raw: true }
    ).then((response) =>{
        // if the order by id doesn´t exist, throws an error
        if (response.length == 0){
            res.status(404)
            throw new Error (`Order with id = ${id} could not be found`);
        }
        // when the order by id exits, gets deleted
        sequelize.query('DELETE orders, order_items FROM orders JOIN order_items ON order_items.order_id = orders.id WHERE id = ?',
            {replacements: [id]}
        ).then((response) => {
            res.status(204).json();
        });
    }).catch(function(err){
        res.json({error: err.message});
    });
});



// Indicates the server is working
app.listen(3000, () => {
    console.log('Server running...');
});

