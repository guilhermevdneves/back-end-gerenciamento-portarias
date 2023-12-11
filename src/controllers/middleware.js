const { StatusCodes } = require('http-status-codes');
const config = require('config');
const jwt = require('jsonwebtoken');
const UserDAO = require('../dao/schemas/user');
const PermissaoDAO = require('../dao/schemas/permissao');

const Middleware = {
  async authorize(request, response, next) {
    console.log('Checking required credentials');
    // const {
    //   userId,
    //   params,
    // } = request;
    // console.log({ params, userId });

    const token = request.headers.authorization;

    // We have routes that don't need credentials
    // if (!token) {
    //   console.log('Missing required credentials');

    //   return next({
    //     status: StatusCodes.UNAUTHORIZED,
    //     message: 'Missing Authorization Header',
    //   });
    // }

    try {
      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        // console.log({ decoded });

        const credentials = await UserDAO.findById(decoded.userId);

        if (credentials) {
          request.credentials = credentials;
        }
      }
    } catch (err) {
      console.log(JSON.stringify(err, 2, null));

      return next({
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid token',
      });
    }

    return next();
  },
  checkPermissionMiddleware(permissionKey) {
    return async (request, response, next) => {
      const { credentials } = request;
      try {
        // Procura a permissão no banco
        const permissaoRoles = await PermissaoDAO.findOne({ key: permissionKey }, 'role');

        // Caso a permissão não tenha 'guest' listada como um dos roles permitidos (ou seja, qualquer pessoa tem acesso a essa permissão),
        // e o tipo do usuário credenciado não está nas roles permitidas, o sistema retorna um erro de Usuário não autorizado
        if (!permissaoRoles?.role.includes('guest') && !permissaoRoles?.role.includes(credentials?.type)) {
          console.log('User Unauthorized');
          return next({
            status: StatusCodes.UNAUTHORIZED,
            message: 'Usuário não autorizado',
          });
        }
      } catch (error) {
        console.log(error);
        return next({
          status: StatusCodes.UNAUTHORIZED,
          message: 'Usuário não autorizado',
        });
      }
      return next();
    };
  },
};

module.exports = Middleware;
