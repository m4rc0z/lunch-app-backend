const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').load();

const Controller = require('../controllers/restaurant.controller');

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// TODO: add unit test for this
const rolesAuth0 = 'https://lunchmenuapp/roles';

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

const onlyForAdmin = (req, res, next) => {
    const roles = req.user[rolesAuth0] || [];
    if (roles.indexOf('admin') > -1) {
        next();
    } else {
        res.status(401).send({message: 'not authorized for admin access'})
    }
};

// TODO: add unit test for this
const adminCheck = (req, res, next) => {
    const roles = req.user[rolesAuth0] || [];
    if (roles.indexOf('admin') > -1) {
        next();
    } else {
        if (req.user.sub !== req.params.id) {
            res.status(401).send({message: 'not authorized for admin access'})
        } else {
            next();
        }
    }
};

router.get('/', checkJwt, onlyForAdmin, Controller.getAll);
router.get('/:id', checkJwt, adminCheck, Controller.get);
router.get('/:id/menus', Controller.getMenus);
router.put('/:id/menus', Controller.updateMenus);
router.delete('/:id/menus', Controller.deleteMenus);
router.put('/:id', checkJwt, adminCheck, Controller.update);

module.exports = router;
