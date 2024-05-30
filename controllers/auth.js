const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);


    const { username, password, passwordConfirm, firstname, lastname} = req.body

    db.query('SELECT username FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {
            return res.render('register', {
                message: 'That username is already in use'
            });
        }
        if (username == '') {
            return res.render('register', {
                message: 'You must enter a username'
            });
        }
        if (password == '') {
            return res.render('register', {
                message: 'You must create a password'
            });
        }
        if (firstname == '' || lastname == '') {
            return res.render('register', {
                message: 'You must enter both a first and last name'
            });
        }
        else if (password != passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        const passwordEncrypted = await bcrypt.hash(password, 8);
        console.log(passwordEncrypted);

        db.query('INSERT INTO users SET ?', {username: username, password: passwordEncrypted, firstname: firstname, lastname: lastname}, (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(results);
                return res.render('register', {
                    message: 'User registered'
            })
            }
        })
    });
}

exports.login = (req, res) => {
    const { usernamein, passwordin } = req.body;

    if (!usernamein || !passwordin) {
        return res.status(400).render('login', {
            message: 'Please provide a username and password'
        });
    }

    db.query('SELECT * FROM users WHERE username = ?', [usernamein], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length === 0) {
            return res.status(401).render('login', {
                message: 'Username not found'
            });
        }

        const match = await bcrypt.compare(passwordin, results[0].password);

        if (!match) {
            return res.status(401).render('login', {
                message: 'Usernmane or Password is incorrect'
            });
        } 
        else {
            return res.render('login', {
                message: 'Logged in successfully!'
            });
        }
    });
};