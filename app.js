require("dotenv-safe").config();
var jwt = require('jsonwebtoken');

//service-base
var http = require('http');
var https = require('https');
const express = require('express');
//const httpProxy = require('express-http-proxy')
var cors = require('cors');
const app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const helmet = require('helmet');
app.use(cors());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/users', verifyJWT, (req, res, next) => {
    res.status(200).send({name: 'Marcus', age:25});
});

app.get('/products', verifyJWT, (req, res, next) => {
    res.status(200).send({name: 'Rice', amount:2});
});

app.post('/login', (req, res, next) => {
    if(req.body.user === 'luiz' && req.body.pwd === '123'){
        const id = 1;
        var token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 3000 // expires in 5min (300 mileseconds)
        });
        res.status(200).send({
             auth: true, 
             token: token 
        });
    } else {
        res.status(500).send('Invalid login');
    }
});

app.post('/auth/login', (req, res, next) => {
    if(req.body.UserName === 'luiz' && req.body.Password === '123'){
        const id = 1;
        var token = jwt.sign({ 
            userName: 'marcuspitz',
            name: 'Marcus Pitz',
            email: 'marcusviniciuspitz@gmail.com',
            roles: [
                {name: 'web.access.it.policy', description:'Role para acesso ao sistema'}
            ],
        }, process.env.SECRET, {
            expiresIn: 3000 // expires in 5min (300 mileseconds)
        });
        res.status(200).send({
            success: true, 
            message: 'Login realizado com sucesso',
            userName: 'marcuspitz',
            name: 'Marcus Pitz',
            email: 'marcusviniciuspitz@gmail.com',
            roles: [
                {name: 'web.access.it.policy', description:'Role para acesso ao sistema'}
            ],
            access_token: token
       });
    } else {
        res.status(500).send('Invalid login');
    }
});

app.get('/logout', function(req, res) {
    res.status(200).send({ auth: false, token: null });
});

function verifyJWT(req, res, next){
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });    
        req.userId = decoded.id;
        next();
    });
}

app.use(logger('dev'));
app.use(helmet());
app.use(cookieParser());

var server = http.createServer(app);
//var server = https.createServer(app);
server.listen(3000, () => {
    console.log("Server running at localhost:3000");
});