/* eslint-disable linebreak-style */
const express = require('express');
const cors = require('cors');

const UserRouter = require('../routers/user_router');
const HealthcheckRouter = require('../routers/health_check');
const PortariaRouter = require('../routers/portaria_router');
const PermissaoRouter = require('../routers/permissao_router');
const AuthenticationRouter = require('../routers/authentication_router');

const { connect } = require('../utils/connect');

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

class DSWA {
  constructor() {
    this._app = express();
    this._app.use(express.json());
    this._app.use(cors(corsOptions));
    this._app.use(UserRouter);
    this._app.use(PortariaRouter);
    this._app.use(PermissaoRouter);
    this._app.use(HealthcheckRouter);
    this._app.use(AuthenticationRouter);
    connect();
  }

  get app() {
    return this._app;
  }
}

module.exports = DSWA;
