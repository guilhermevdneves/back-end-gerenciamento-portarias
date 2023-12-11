const { StatusCodes } = require('http-status-codes');

const PermissaoDAO = require('../dao/schemas/permissao');
const Permissao = require('../dao/model/permissao');

const PermissaoController = {
  async createPermissao(request, response, next) {
    const { body } = request;
    try {
      const permissao = new Permissao(body);

      await PermissaoDAO.create(permissao.toJSON());

      return response.status(StatusCodes.OK).send();
    } catch (error) {
      const errorMessage = {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
      console.log(error);
      return next(errorMessage.message);
    }
  },

  async readById(request, response, next) {
    const {
      params: { id },
    } = request;

    try {
      const permissao = await PermissaoDAO.findById({ id });
      if (permissao) {
        return response.status(StatusCodes.OK).json(new Permissao(permissao));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving permissao ${id} data. Error: ${error}`);
      return next(error);
    }
  },

  async readList(request, response, next) {
    try {
      const {
        query,
      } = request;

      const permissaos = await PermissaoDAO.find(query);
      response.set({
        'total-count': permissaos.length,
      });

      if (permissaos) {
        return response
          .status(StatusCodes.OK)
          .json(permissaos.map((permissao) => new Permissao(permissao)));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving permissaos list. Error: ${error}`);
      return next(error);
    }
  },

  async read(request, response, next) {
    try {
      const {
        params: { id },
      } = request;
      let permissao;

      if (id) {
        permissao = await PermissaoDAO.findById(id);
      }

      if (permissao) {
        return response.status(StatusCodes.OK).json(new Permissao(permissao));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving permissao by ID. Error: ${error}`);
      return next(error);
    }
  },

  async update(request, response, next) {
    const {
      params: { id },
      body,
    } = request;

    try {
      let permissao;

      if (id) {
        permissao = await PermissaoDAO.findByIdAndUpdate(id, { ...body });
      }

      if (permissao) {
        return response.status(StatusCodes.OK).json(new Permissao(permissao));
      }

      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error updating permissao ${id} data. Error: ${error}`);
      return next(error);
    }
  },
  async delete(request, response, next) {
    const {
      params: { id },
    } = request;

    try {
      let permissao;

      if (id) {
        permissao = await PermissaoDAO.findByIdAndRemove(id);
      }

      if (permissao) {
        return response.status(StatusCodes.OK).json(new Permissao(permissao));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error deleting permissao ${id} data. Error: ${error}`);
      return next(error);
    }
  },
};

module.exports = PermissaoController;
