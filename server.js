const express = require('express'); 
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const auth = (req, res, next) => {
    try {
    let authCookie = req.cookies.auth;
    let authbuffer = Buffer.from(authCookie.split(' ')[1], 'base64');
    let auth = authbuffer.toString().split(':');

    if ( auth[0] === 'user' && auth[1] === 'password' || auth[0] === 'przemo.surma@gmail.com' && auth[1] === '116833152403828627534' ) {
        return next();
    }
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
} catch (e) {
    return next();
}
};

app.get('/css/style.css', (req, res) => {
    fs.readFile('static/style.css', (err, data) => {
        if (err) {
            res.status(500).send(`Error getting the file: ${err}.`);
        } else {
            res.set('Content-Type', 'text/css').send(data);
        }
    });
});

app.get('/', auth, (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/login', (req, res) => {
    fs.readFile(__dirname + '/static/login.html', (err, data) => {
        if (err) {
            res.status(500).send(`Error getting the file: ${err}.`);
        } else {
            res.set('Content-Type', 'text/html').send(data);
        }
    });
});

app.post('/login', (req, res) => {
    let contentType = req.headers['content-type'];
    if (contentType === 'application/x-www-form-urlencoded'){
        const {credential, g_csrf_token} = req.body;
        let jwt = jsonwebtoken.decode(credential);
        
        res.cookie('auth', `Basic ${Buffer.from(`${jwt.email}:${jwt.sub}`).toString('base64')}`);
        res.redirect('/')
        return
    }
    let username = req.body.username;
    let password = req.body.password;
    if (username === "user" && password === "password") {
        res.cookie('auth', `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
        res.send()
    } else {
        res.status(401)
        res.json({ error: 'Incorrect login data'});
    }
});

const port = 3000

app.listen(port, () => console.log(`This app is listening on port ${port}`));