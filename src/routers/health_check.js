/**
 * Modules
 */
const { StatusCodes } = require('http-status-codes');

/**
* Express Router
*/
const HealthcheckRouter = require('express').Router();

HealthcheckRouter.get('/', (req, res) => {
  res
    .status(StatusCodes.OK)
    .send({
      title: 'PORTARIAS BACKEND',
      version: '0.0.1',
    });
});

module.exports = HealthcheckRouter;
