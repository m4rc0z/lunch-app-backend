const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const mongoose = require('mongoose');
require('dotenv').load();
require('../models/MenuModel.js');
const Menu = mongoose.model('Menu');

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

router.get('/menus/', function (req, res) {
    Menu.find({RID: '1'})
        .exec(function (err, menus) {
            if (err) return handleError(err);
            console.log('Found Menus %s', menus);
            // TODO: fix this ugly code
            res.send(menus[0]);
        });
});

router.put('/menus/', function (req, res) {
    Menu.findOneAndUpdate(
        {RID: '1'},
        {$addToSet: {menus: req.body}},
        {upsert: true},
        function (err, menus) {
            // Deal with the response data/error
        })
        .then(menus => {
            // TODO: fix this ugly code
            res.send(menus);
        });
});

module.exports = router;
