/**
 * Express Router
 */
const AuthenticationRouter = require('express').Router();

/**
  * Authentication controller
*/
const AuthenticationController = require('../controllers/authentication_controller');

AuthenticationRouter.route('/login')
  .post(AuthenticationController.login);

module.exports = AuthenticationRouter;
