/**
 * Express Router
 */
const UserRouter = require('express').Router();

/**
  * User controller
*/
const UserController = require('../controllers/user_controller');
const Middleware = require('../controllers/middleware');

/**
 * Utils
 */
const Constants = require('../utils/constants');

UserRouter.route('/users')
  .get(Middleware.authorize, Middleware.checkPermissionMiddleware('visualizar.usuarios'), UserController.readList);

UserRouter.route('/user')
  .post(Middleware.authorize, Middleware.checkPermissionMiddleware('criar.usuario'), UserController.createUser);

UserRouter.route(`/users/:id(${Constants.UUID_V4_REGEX})`)
  .get(Middleware.authorize, Middleware.checkPermissionMiddleware('visualizar.usuario'), UserController.read)
  .put(Middleware.authorize, Middleware.checkPermissionMiddleware('editar.usuario'), UserController.update)
  .delete(Middleware.authorize, Middleware.checkPermissionMiddleware('excluir.usuario'), UserController.delete);

module.exports = UserRouter;
