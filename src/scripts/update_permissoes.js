const { connect, disconnect } = require('../utils/connect');
const permissoes = require('./permissoes');

const Permissao = require('../dao/model/permissao');
const PermissaoDAO = require('../dao/schemas/permissao');

async function updatePermissoes() {
  try {
    await connect();

    // first let's delete all permissions from the DB
    console.log('Deleting permissions from DB');
    await PermissaoDAO.deleteMany({});
    console.log('Permissions deleted from DB');

    console.log('Adding permissions to DB');
    const addingToDb = permissoes.map((permissao) => PermissaoDAO.create((new Permissao(permissao)).toJSON()));
    console.log('Permissions added to DB');

    await Promise.all(addingToDb);
  } catch (error) {
    console.log('Error while creating Permissao on database', error.message);
  } finally {
    await disconnect();
  }
}

updatePermissoes();
