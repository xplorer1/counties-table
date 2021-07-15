const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const appstorage = require("./app/utils/nodepersist");

let mongoose = require('mongoose'); // for working w/ our database
let config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true });

let conn = mongoose.connection;
conn.on('error', function(err){
    console.log('mongoose connection error:', err.message);
});

if(!appstorage.get("blacklist")) { //for setting the stage for storing expired tokens.
    appstorage.set("blacklist", []);
}

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.raw({limit: '5mb'}) );

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token,X-Requested-With,Content-Type,Authorization');
    res.setHeader('X-Powered-By', 'Lucky Lucciano');
    next();
});

let OrderRoutes = require('./app/routes/OrderRoutes');
let UserRoutes = require('./app/routes/UserRoutes');
let AuthRoutes = require('./app/routes/AuthRoutes');
let MenuRoutes = require('./app/routes/MenuRoutes');

app.use(function(req, res, next) {
    console.log(req.method, req.url);
    next(); 
});

app.get("/", function(req, res, next) {
    return res.send("App properly hosted.");
});

app.use("/api/order", OrderRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/menu", MenuRoutes);

app.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

app.listen(config.port, () => console.log(`Magic happening on port ${config.port}!`))