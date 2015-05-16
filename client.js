var express = require("express");
var https = require('https');
var http = require('http');
var morgan = require("morgan");
var port = process.env.PORT || 3000;
var app = express();

app.use(morgan("dev"));
app.use(express.static("./app"));

app.get("/", function(req, res) {
    res.sendFile("./app/index.html");
});

app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});