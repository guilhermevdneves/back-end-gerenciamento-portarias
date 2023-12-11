const mongoose = require('mongoose');
const config = require('config');

let connection = null;

const getConnection = () => connection;

const connect = async () => {
  mongoose.Promise = global.Promise;

  try {
    await mongoose.connect(
      `mongodb+srv://${config.mongo.username}:${config.mongo.password}@${config.mongo.address}/?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    connection = mongoose.connection;

    console.log('Successfully connected to Mongo database');
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error}`);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();

    console.log('Successfully disconnected to Mongo database');
  } catch (error) {
    console.log(`Error disconnecting to MongoDB: ${error}`);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect,
  getConnection,
};
