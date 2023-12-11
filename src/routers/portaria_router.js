/**
 * Express Router
 */
const PortariaRouter = require('express').Router();

/**
  * Portaria controller
*/
const PortariaController = require('../controllers/portaria_controller');
const Middleware = require('../controllers/middleware');

/**
 * Utils
 */
// const Constants = require('../utils/constants');

PortariaRouter.route('/portarias')
  .get(Middleware.authorize, Middleware.checkPermissionMiddleware('visualizar.portaria'), PortariaController.readList);

PortariaRouter.route('/portaria')
  .post(Middleware.authorize, Middleware.checkPermissionMiddleware('criar.portaria'), PortariaController.createPortaria);

PortariaRouter.route('/portarias/:id')
// PortariaRouter.route(`/portarias/:id(${Constants.UUID_V4_REGEX})`)
  .get(Middleware.authorize, Middleware.checkPermissionMiddleware('visualizar.portaria'), PortariaController.read)
  .put(Middleware.authorize, Middleware.checkPermissionMiddleware('editar.portaria'), PortariaController.update)
  .delete(Middleware.authorize, Middleware.checkPermissionMiddleware('excluir.portaria'), PortariaController.delete);

// PortariaRouter.route('/portarias/:numero')
//   .get(PortariaController.read)
//   .put(PortariaController.update)
//   .delete(PortariaController.delete);

module.exports = PortariaRouter;
