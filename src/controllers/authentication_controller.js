const { StatusCodes } = require('http-status-codes');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserDAO = require('../dao/schemas/user');

const AuthenticationController = {
  async login(request, response, next) {
    const {
      body: { username, password },
    } = request;
    try {
      const user = await UserDAO.findOne({ username });

      if (!user) {
        return response.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordsMatchs = await bcrypt.compare(password, user.password);

      if (!passwordsMatchs) {
        return response.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: '1h' });

      return response.status(StatusCodes.OK).json({
        token,
        user: {
          numbers: user.numbers,
          username: user.username,
        },
      });
    } catch (error) {
      const errorMessage = {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Authentication error: ${error}`,
      };
      return next(errorMessage);
    }
  },
};

module.exports = AuthenticationController;
