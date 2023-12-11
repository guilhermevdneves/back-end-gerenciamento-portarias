const fs = require('fs');
const path = require('path');

const { connect, disconnect } = require('../utils/connect');
const { CLASSIFICACAO_MAP } = require('../utils/constants');

const Portaria = require('../dao/model/portaria');
const PortariaDAO = require('../dao/schemas/portaria');
const PortariaController = require('../controllers/portaria_controller');

const year = process.argv[2];
let headerIndexes;
let notInBackPressure = true;

const portariasStream = fs
  .createReadStream(path.join(__dirname, 'portarias', `portaria_${year}.csv`), { encoding: 'utf8', highWaterMark: (2 * 1024) });
const createdPortariasStream = fs
  .createWriteStream(path.join(__dirname, 'portarias', `create_portaria_alteracoes_${year}.csv`));
const failedPortariasStream = fs
  .createWriteStream(path.join(__dirname, 'portarias', `failed_create_portaria_${year}_${Date.now()}.csv`));

const writePortariaPesistence = async (success, portaria, line, parsedData) => {
  if (!notInBackPressure) {
    return setImmediate(() => writePortariaPesistence(success, portaria, line));
  }

  const {
    id, numero,
  } = portaria;

  // For each student write in separate files when updated or not
  if (!success) {
    notInBackPressure = failedPortariasStream
      .write(`${line}\n`, 'utf8');
  } else {
    // Encontre a primeira palavra na frase (alterada, revogada, extinta)
    const situacao = parsedData?.[headerIndexes.situacao];
    const situacaoVerbo = situacao.match(/\b\w+\b/)[0];

    const alteracao = parsedData?.[headerIndexes.alteracao] ? parsedData?.[headerIndexes.alteracao] : '';

    // Encontre o valor após a palavra "Portaria"
    const match = situacao.match(/Portaria\s+([\w./]+)/);
    const numeroPortaria = match ? match[1] : '';
    notInBackPressure = createdPortariasStream
      .write(`${year},${id},${numero},${situacaoVerbo.toLowerCase()},${alteracao},${numeroPortaria},"${situacao}"\n`, 'utf8');
  }
  return true;
};

const getHeader = (headerLine) => {
  const headers = headerLine.split(',');
  const cleanedHeaders = headers.map((column) => `${column}`.replace(/\s+/g, '').toLowerCase());

  createdPortariasStream.write('ano,id,numero,situacao,alteraPortaria,alteradaPorPortaria,rawAlteracao\n', 'utf8');
  failedPortariasStream.write(`${headerLine}\n`, 'utf8');

  headerIndexes = {
    ano: cleanedHeaders.indexOf('ano'),
    numero: cleanedHeaders.indexOf('numero'),
    publicacao: cleanedHeaders.indexOf('publicacao'),
    assunto: cleanedHeaders.indexOf('assunto'),
    classificacao: cleanedHeaders.indexOf('classificacao'),
    situacao: cleanedHeaders.indexOf('situacao'),
    validade: cleanedHeaders.indexOf('validade'),
    servidores: cleanedHeaders.indexOf('servidores'),
    link: cleanedHeaders.indexOf('link'),
    alteracao: cleanedHeaders.indexOf('alteracao'),
  };
};

const persistData = async (lines) => {
  const portarias = [];

  try {
    // eslint-disable-next-line no-plusplus
    while (lines.length) {
      const line = lines.shift();
      // Use uma expressão regular para dividir a frase
      const partes = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      // Remova as aspas das partes que contêm texto entre aspas
      const data = partes.map((parte) => parte.replace(/^"(.*)"$/, '$1'));

      const isEmpty = data.every((field) => !field.replace(/\s+/g, '').length);

      let servidores = data?.[headerIndexes.servidores];
      if (servidores && servidores?.trim() !== '') {
        servidores = servidores.split(/[;,]\s*/).map((servidor) => ({ nome: servidor.trim() }));
      } else {
        servidores = [];
      }

      const publicacao = data?.[headerIndexes.publicacao];

      const permanente = data?.[headerIndexes.permanente]?.toLowerCase() === 't';

      if (!isEmpty) {
        const numero = data?.[headerIndexes.numero];
        const portaria = new Portaria({
          ano: year,
          numero: numero.slice(0, 4) === 'CPV.' ? numero : PortariaController.standardizeNumero(numero),
          publicacao: publicacao ? new Date(publicacao).getTime() : null,
          assunto: data?.[headerIndexes.assunto],
          link: data?.[headerIndexes.link]?.replace('-', ''),
          classificacao: CLASSIFICACAO_MAP[data?.[headerIndexes.classificacao]?.replace('-', '')],
          permanente, // alguns anos não tem esse campo
          situacao: data?.[headerIndexes.situacao]?.match(/\b\w+\b/)?.[0].toLowerCase(),
          validade: data?.[headerIndexes.validade].replace('-', ''),
          servidores,
          // alteracoes: data?.[headerIndexes.alteracao],
          createdBy: 'Sistema',
        });
        portarias.push(PortariaDAO.create(portaria)
          .then((success) => {
            console.log(`Portaria ${portaria?.numero} criada com sucesso. ID: ${success?.id}`);
            return writePortariaPesistence(true, success, line, data);
          })
          .catch((error) => {
            console.log(`Erro ao criar portaria ${portaria?.numero}`, error);
            return writePortariaPesistence(false, portaria, line, data);
          }));
      }
    }
    return await Promise.all(portarias);
  } catch (error) {
    console.log('Error:', error);
    return error;
  }
};

const persistPortarias = () => new Promise(async (resolve, reject) => {
  const errorHandler = async (error) => {
    console.log('Error persisting Portarias', {
      message: error.message,
    });
    return reject(error);
  };

  try {
    await connect();
    console.log('Connected to the db');

    let chunkHolder = '';
    // console.log({ chunkHolder });

    portariasStream.on('data', async (chunk) => {
      try {
        portariasStream.pause();

        chunkHolder += chunk;
        // console.log('1', { chunkHolder });
        const lines = chunkHolder.split('\n');

        if (!headerIndexes) {
          getHeader(lines.shift());
          console.log(headerIndexes);
        }

        // save the last line, ther's high chances that it will be incomplete
        chunkHolder = lines.pop();
        // console.log('2', { chunkHolder });

        await persistData(lines);

        return portariasStream.resume();
      } catch (error) {
        console.log('Error while creating Portaria on database', error.message);
        return errorHandler(error);
      }
    });

    portariasStream.on('error', (error) => errorHandler(error));

    const onEnd = async () => {
      if (portariasStream.isPaused()) {
        return setImmediate(onEnd);
      }

      // console.log('3', { chunkHolder });
      await persistData(chunkHolder.split('\n'));

      try {
        createdPortariasStream.end('', 'utf8', () => { });
        await disconnect();
        return failedPortariasStream.end('', 'utf8', () => resolve());
      } catch (error) {
        return errorHandler(error);
      }
    };

    failedPortariasStream.on('drain', () => {
      notInBackPressure = true;
    });

    return portariasStream.on('end', onEnd);
  } catch (error) {
    console.log(`Error while reading file portarias_${year}.csv`, error.message);
  } finally {
    // await disconnect();
  }
});

persistPortarias()
  .then(() => {
    console.log('Portaria sucessfully persisted');
    return process.exit(0);
  })
  .catch((error) => {
    console.log('Problem persisting Portaria', { message: error.message });
    return process.exit(0);
  });
