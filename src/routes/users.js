const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
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

// This route doesn't need authentication
router.get('/public', function(req, res) {
    res.send({
        message: 'Hello from a public endpoint! You not need to be authenticated to see this.'
    });
});

// This route need authentication
router.get('/private', checkJwt, function(req, res) {
    res.send({
        message: 'Hello from a private endpoint! You need to be authenticated to see this.'
    });
});

const checkScopes = jwtAuthz([ 'read:messages' ]);

router.get('/private-scoped', checkJwt, checkScopes, function(req, res) {
    res.send({
        message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
    });
});

module.exports = router;
