const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const UserDAO = require('../dao/schemas/user');
const User = require('../dao/model/user');

const AuthenticationController = {
  async createUser(request, response, next) {
    const {
      body,
    } = request;
    try {
      const sal = bcrypt.genSaltSync(10);
      const userInput = body?.password ? { ...body, password: bcrypt.hashSync(body.password, sal) } : body;
      const user = User(userInput);

      // await UserDAO.create({
      //   username: 'usuario123',
      //   password: bcrypt.hashSync('123', sal),
      //   name: 'Usuário 123',
      //   email: 'usuario123@gmail.com',
      //   type: 'guest',
      // });
      // await UserDAO.create({
      //   username: 'usuario456',
      //   password: bcrypt.hashSync('456', sal),
      //   name: 'Usuário 456',
      //   email: 'usuario456@gmail.com',
      //   type: 'servidor',
      // });
      // await UserDAO.create({
      //   username: 'usuario789',
      //   password: bcrypt.hashSync('789', sal),
      //   name: 'Usuário 789',
      //   email: 'usuario789@gmail.com',
      //   type: 'admin',
      // });

      await UserDAO.create(user);

      return response.status(StatusCodes.OK).send();
    } catch (error) {
      const errorMessage = {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error,
      };
      return next(errorMessage);
    }
  },

  async read(request, response, next) {
    const {
      params: { id },
    } = request;

    try {
      const user = await UserDAO.findById(id);
      if (user) {
        return response.status(StatusCodes.OK).json(new User(user));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving user ${id} data. Error: ${error}`);
      return next(error);
    }
  },

  async readList(request, response, next) {
    try {
      const {
        query,
      } = request;

      let searchQuery;
      if (query?.name) {
        searchQuery = { name: { $regex: new RegExp(query.name, 'i') } };
      }

      const users = await UserDAO.find(searchQuery);
      response.set({
        'total-count': users.length,
      });

      if (users) {
        return response
          .status(StatusCodes.OK)
          .json(users.map((user) => new User(user)));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving users list. Error: ${error}`);
      return next(error);
    }
  },
  async update(request, response, next) {
    const {
      params: { id },
      body,
    } = request;

    try {
      const user = await UserDAO.findByIdAndUpdate(id, { ...body });

      if (user) {
        return response.status(StatusCodes.OK).json(new User(user));
      }

      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error updating user ${id} data. Error: ${error}`);
      return next(error);
    }
  },
  async delete(request, response, next) {
    const {
      params: { id },
    } = request;

    try {
      const user = await UserDAO.findByIdAndRemove(id);
      if (user) {
        return response.status(StatusCodes.OK).json(new User(user));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error deleting user ${id} data. Error: ${error}`);
      return next(error);
    }
  },
};

module.exports = AuthenticationController;
