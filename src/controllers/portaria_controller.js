const { StatusCodes } = require('http-status-codes');

const { QUERY_PARAMS_KEYS, LIKE_FIELDS, EXACT_OR_IN_FIELDS } = require('../utils/constants');
const { getCommonValues } = require('../utils/array');
const { getConnection } = require('../utils/connect');

const PortariaDAO = require('../dao/schemas/portaria');
const Portaria = require('../dao/model/portaria');

const prefix = 'CPV.';

const PortariaController = {
  standardizeNumero(numero) {
    const zerosToAdd = 4 - numero.toString().length;
    const numberWithZeros = `${'0'.repeat(zerosToAdd)}${numero}`;

    return `${prefix}${numberWithZeros}`;
  },

  // Define the function to get the next auto-incremented value
  async getNextAutoIncrementedValue(field, year) {
    const fieldName = `${year}-${field}`;
    const filter = { _id: fieldName };
    const sequenceDocument = await getConnection()?.collection('sequences').findOne(filter);

    if (!sequenceDocument) {
      const initialValue = 1;
      await getConnection()?.collection('sequences').insertOne({ _id: fieldName, sequence_value: initialValue });
      return `${prefix}000${initialValue}`;
    }

    const currentSequenceValue = sequenceDocument.sequence_value + 1;

    await getConnection()?.collection('sequences').updateOne(filter, { $inc: { sequence_value: 1 } });

    return this.standardizeNumero(currentSequenceValue);
  },

  async createPortaria(request, response, next) {
    const { body, credentials } = request;

    try {
      // Use the function to generate auto-incremented values
      const year = new Date(body?.publicacao).getFullYear();
      const autoIncrementedValue = await PortariaController.getNextAutoIncrementedValue('numero', year);
      const documentToInsert = {
        ...body,
        numero: autoIncrementedValue,
        createdBy: credentials?.id,
        ano: year,
      };

      const portaria = new Portaria(documentToInsert);
      const createdPortaria = await PortariaDAO.create(portaria.toJSON());

      return response.status(StatusCodes.OK).json(new Portaria(createdPortaria));
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
      const portaria = await PortariaDAO.findById({ id });
      if (portaria) {
        return response.status(StatusCodes.OK).json(new Portaria(portaria));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving portaria ${id} data. Error: ${error}`);
      return next(error);
    }
  },

  getQueryParams(paramsKey, query) {
    const searchObj = {};

    paramsKey.forEach((key) => {
      const value = query[key];
      if (value) {
        if (LIKE_FIELDS.includes(key)) {
          searchObj[key] = { $regex: new RegExp(value, 'i') };
        } else if (EXACT_OR_IN_FIELDS.includes(key)) {
          if (value.includes(',')) {
            searchObj[key] = { $in: value.toLowerCase().split(',') };
          } else {
            searchObj[key] = value.toLowerCase();
          }
        }
      }
    });

    return searchObj;
  },

  async readList(request, response, next) {
    try {
      const {
        query: {
          limit,
          offset,
          // sorteBy,
          // sortDirection,
          ...rest
        },
      } = request;

      const allowedParams = getCommonValues(Object.keys(rest), Object.values(QUERY_PARAMS_KEYS));

      const finalQuery = PortariaController.getQueryParams(allowedParams, rest);
      const options = {};
      if (limit) {
        options.limit = limit;
      }
      if (offset) {
        options.skip = offset;
      }
      const [portarias, count] = await Promise.all([
        PortariaDAO.find(finalQuery, null, options),
        PortariaDAO.countDocuments(finalQuery),
      ]);
      response.set({
        'total-count': count,
      });

      if (portarias) {
        return response
          .status(StatusCodes.OK)
          .json(portarias.map((portaria) => new Portaria(portaria)));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving portarias list. Error: ${error}`);
      return next(error);
    }
  },

  async read(request, response, next) {
    try {
      const {
        params: { id },
      } = request;
      let portaria;

      if (id) {
        portaria = await PortariaDAO.findById(id);
      }

      if (portaria) {
        return response.status(StatusCodes.OK).json(new Portaria(portaria));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error retrieving portaria by ID. Error: ${error}`);
      return next(error);
    }
  },

  async update(request, response, next) {
    const {
      params: { id },
      body,
      // body: {
      //   alteracoes,
      //   ...rest
      // },
    } = request;

    try {
      let portaria;

      if (id) {
        portaria = await PortariaDAO.findByIdAndUpdate(id, { ...body });
        // portaria = await PortariaDAO.findByIdAndUpdate(id, { $push: { alteracoes }, ...rest });
      }

      if (portaria) {
        return response.status(StatusCodes.OK).json(new Portaria(portaria));
      }

      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error updating portaria ${id} data. Error: ${error}`);
      return next(error);
    }
  },
  async delete(request, response, next) {
    const {
      params: { id },
    } = request;

    try {
      let portaria;

      if (id) {
        portaria = await PortariaDAO.findByIdAndRemove(id);
      }

      if (portaria) {
        return response.status(StatusCodes.OK).json(new Portaria(portaria));
      }
      return response.status(StatusCodes.NOT_FOUND).send();
    } catch (error) {
      console.log(`Error deleting portaria ${id} data. Error: ${error}`);
      return next(error);
    }
  },
};

module.exports = PortariaController;
