const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const mongoose = require('mongoose');
require('dotenv').load();

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH_DOMAIN}/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: process.env.AUTH_AUDIENCE,
    issuer: `https://${process.env.AUTH_DOMAIN}/`,
    algorithms: ['RS256']
});

function handleError(error) {
    console.error(error);
}

const mongoDB = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
console.log(mongoDB);
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message: String,
    type: String,
});

const menuSchema = new Schema({
    RID: String,
    menus: [{
        price: Number,
        date: Date,
        courses: [{
            course: Number,
            description: String
        }]
    }]
});

const MessageModel = mongoose.model('MessageModel', messageSchema);
const MenuModel = mongoose.model('MenuModel', menuSchema, 'menus');

const publicInstance = new MessageModel({message: 'awesome public', type: 'public'});

publicInstance.save(function (err) {
    if (err) return handleError(err);
    // saved!
});

const privateInstance = new MessageModel({message: 'awesome private', type: 'private'});

privateInstance.save(function (err) {
    if (err) return handleError(err);
    // saved!
});

// This route doesn't need authentication
router.get('/public', function (req, res) {
    MessageModel.findOne().where('type').equals('public')
        .exec(function (err, message) {
            if (err) return handleError(err);
            console.log('Found Public Message %s', message.message);
            res.send({
                message: message.message
            });
        });
});

// This route need authentication
router.get('/private', checkJwt, function (req, res) {
    MessageModel.findOne().where('type').equals('private')
        .exec(function (err, message) {
            if (err) return handleError(err);
            console.log('Found Private Message %s', message.message);
            res.send({
                message: message.message
            });
        });
});

router.get('/menus/', checkJwt, function (req, res) {
    MenuModel.remove();
    MenuModel.find()
        .exec(function (err, menus) {
            if (err) return handleError(err);
            console.log('Found Menus %s', menus);
            // TODO: fix this ugly code
            res.send(menus[0]);
        });
});

const checkScopes = jwtAuthz(['read:messages']);

router.get('/private-scoped', checkJwt, checkScopes, function (req, res) {
    res.send({
        message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
    });
});

module.exports = router;
