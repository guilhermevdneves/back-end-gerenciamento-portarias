const config = require('config');

const Api = require('./src/app');

const spawnMainApp = () => {
  const api = new Api();

  api.app.listen(config.get('port'), () => {
    console.log(`Server successfully started on port: ${config.get('port')}`);
  });

  return true;
};

spawnMainApp();
