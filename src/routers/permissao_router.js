/**
 * Express Router
 */
const PermissaoRouter = require('express').Router();

/**
  * Permissao controller
*/
const PermissaoController = require('../controllers/permissao_controller');
const Middleware = require('../controllers/middleware');

/**
 * Utils
 */
const Constants = require('../utils/constants');

PermissaoRouter.route('/permissoes')
  .get(Middleware.authorize, Middleware.checkPermissionMiddleware('visualizar.permissao'), PermissaoController.readList);

PermissaoRouter.route('/permissao')
  .post(Middleware.authorize, Middleware.checkPermissionMiddleware('criar.permissao'), PermissaoController.createPermissao);

PermissaoRouter.route(`/permissoes/:id(${Constants.UUID_V4_REGEX})`)
  .get(Middleware.authorize, Middleware.checkPermissionMiddleware('visualizar.permissao'), PermissaoController.read)
  .put(Middleware.authorize, Middleware.checkPermissionMiddleware('editar.permissao'), PermissaoController.update)
  .delete(Middleware.authorize, Middleware.checkPermissionMiddleware('excluir.permissao'), PermissaoController.delete);

// PermissaoRouter.route('/permissoes/:numero')
//   .get(PermissaoController.read)
//   .put(PermissaoController.update)
//   .delete(PermissaoController.delete);

module.exports = PermissaoRouter;
