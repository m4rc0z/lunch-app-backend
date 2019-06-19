const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').load();

const Controller = require('../controllers/menu.controller');

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

router.get('/menus/', checkJwt, Controller.get);

router.put('/menus/', checkJwt, Controller.update);

router.delete('/menus/', checkJwt, Controller.delete);

module.exports = router;
