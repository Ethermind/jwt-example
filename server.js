var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
var app = express();
var port = process.env.PORT || 3001;
var User = require('./models/User');
var key = "shhhh that's a secret my FRIEND! :)";

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/jwt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.post('/authenticate', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                var token = jwt.sign(user, key, {});
                res.json({
                    type: true,
                    data: token
                });                               
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });    
            }
        }

    });
});

app.post('/signin', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
                res.json({
                    type: false,
                    data: "User already exists!"
                });
            } else {
                var userModel = new User();
                userModel.email = req.body.email;
                userModel.password = req.body.password;
                userModel.save(function(err, user) {
                    if(err) {
                        res.json({
                            type: false,
                            data: "Error occured: " + err
                        });
                    } else {
                        var token = jwt.sign(user, key, {});
                        user.save(function(err, user1) {
                            res.json({
                                type: true,
                                data: token
                            });
                        });
                    }
                })
            }
        }
    });
});

app.get('/me', ensureAuthorized, function(req, res) {    
    User.findOne({_id: req.userId}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

function ensureAuthorized(req, res, next) {
    var token = req.headers["authorization"];
    if (typeof token !== 'undefined') {
        jwt.verify(token, key, function(err, decoded) {
            if (err) {
                res.send(401, 'Invalid token:' + err);
            } else {
                req.userId = decoded._id;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
});

app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});