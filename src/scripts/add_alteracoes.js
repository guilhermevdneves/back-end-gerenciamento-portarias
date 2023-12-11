const fs = require('fs');
const path = require('path');

const { connect, disconnect } = require('../utils/connect');

// const Portaria = require('../dao/model/portaria');
const PortariaDAO = require('../dao/schemas/portaria');
const PortariaController = require('../controllers/portaria_controller');

const year = process.argv[2];
let headerIndexes;
let notInBackPressure = true;

const portariasStream = fs
  .createReadStream(path.join(__dirname, 'portarias', `create_portaria_alteracoes_${year}.csv`), { encoding: 'utf8', highWaterMark: (2 * 1024) });
const createdPortariasStream = fs
  .createWriteStream(path.join(__dirname, 'alteracoes', `successfull_alteracoes_${year}_${Date.now()}.csv`));
const failedPortariasStream = fs
  .createWriteStream(path.join(__dirname, 'alteracoes', `failed_alteracoes_${year}_${Date.now()}.csv`));

const writePortariaPesistence = async (success, port, line, parsedData) => {
  if (!notInBackPressure) {
    return setImmediate(() => writePortariaPesistence(success, port, line, parsedData));
  }

  const {
    portaria: { numero, ano },
    alteracoes: { situacao: s }, // alteracoes,
  } = port;

  // For each student write in separate files when updated or not
  if (!success) {
    const p = {
      ano: parsedData?.[headerIndexes.ano],
      id: parsedData?.[headerIndexes.id],
      numero: parsedData?.[headerIndexes.numero],
      situacao: parsedData?.[headerIndexes.situacao],
      alteraPortaria: parsedData?.[headerIndexes.alteraPortaria],
      alteradaPorPortaria: parsedData?.[headerIndexes.alteradaPorPortaria],
      rawAlteracao: parsedData?.[headerIndexes.rawAlteracao],
    };
    notInBackPressure = failedPortariasStream
      // eslint-disable-next-line max-len
      .write(`${p.ano},${p.id},${p.numero},${p.situacao},${s} ${numero}/${ano},${p.alteradaPorPortaria},${p.rawAlteracao}\n`, 'utf8');
  } else {
    // Encontre a primeira palavra na frase
    const situacao = parsedData?.[headerIndexes.situacao];
    const situacaoVerbo = situacao.match(/\b\w+\b/)[0];

    // Encontre o valor após a palavra "Portaria"
    const match = situacao.match(/Portaria\s+([\w./]+)/);
    const numeroPortaria = match ? match[1] : null;
    notInBackPressure = createdPortariasStream
      .write(`${parsedData?.[headerIndexes.id]},${numero},${ano},${situacaoVerbo},${numeroPortaria},"${situacao}"\n`, 'utf8');
  }
  return true;
};

const getHeader = (headerLine) => {
  const headers = headerLine.split(',');
  const cleanedHeaders = headers.map((column) => `${column}`.replace(/\s+/g, '').toLowerCase());

  createdPortariasStream.write('id,numeroPortariaAlterada,anoPortariaAlterada,situacao,alteracoes,rawAlteracao\n', 'utf8');
  failedPortariasStream.write('ano,id,numero,situacao,alteraportaria,alteradaporportaria,rawalteracao\n', 'utf8');

  headerIndexes = {
    ano: cleanedHeaders.indexOf('ano'),
    id: cleanedHeaders.indexOf('id'),
    numero: cleanedHeaders.indexOf('numero'),
    situacao: cleanedHeaders.indexOf('situacao'),
    alteraPortaria: cleanedHeaders.indexOf('alteraportaria'),
    alteradaPorPortaria: cleanedHeaders.indexOf('alteradaporportaria'),
    rawAlteracao: cleanedHeaders.indexOf('rawalteracao'),
  };
};
const extrairAlteracoes = (texto) => {
  // console.log({ texto });
  // Dividir o texto em palavras separadas por espaço
  const palavras = texto.split(' ');

  // Extrair o alteracao (primeira palavra)
  const alteracao = palavras[0];

  // Extrair as portarias (demais palavras) usando uma expressão regular abrangente
  const portarias = palavras.slice(1).join(' ').match(/(\d{1,4})\/(\d{4})/g) || [];

  // Converter as portarias em objetos com os campos "numero" e "ano"
  const portariasFormatadas = portarias.map((portaria) => {
    const [numero, ano] = portaria.split('/');
    return { numero: PortariaController.standardizeNumero(numero), ano };
  });

  // Retornar um objeto com as informações
  return { alteracao, portarias: portariasFormatadas };
};

const persistData = async (lines) => {
  const portarias = [];

  try {
    while (lines.length) {
      const line = lines.shift();
      // Use uma expressão regular para dividir a frase
      const partes = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      // Remova as aspas das partes que contêm texto entre aspas
      const data = partes.map((parte) => parte.replace(/^"(.*)"$/, '$1'));

      // console.log({ data });

      const isEmpty = data.every((field) => !field.replace(/\s+/g, '').length);

      if (!isEmpty) {
        // const numero = data?.[headerIndexes.numero];
        const alteraPortaria = extrairAlteracoes(data?.[headerIndexes.alteraPortaria]);

        // eslint-disable-next-line no-loop-func
        portarias.push(...alteraPortaria?.portarias.map((portaria) => {
          const alteracoes = { idPortaria: data?.[headerIndexes.id], situacao: alteraPortaria?.alteracao?.toLowerCase() };
          // console.log({ alteracoes });
          return PortariaDAO
            .findOneAndUpdate(portaria, { $push: { alteracoes } })
            .then((success) => {
              // console.log({ success });
              console.log(`Portaria ${portaria?.numero}, do ano ${portaria?.ano} atualizada com sucesso. ID: ${success?.id}`);
              // Significa que a portaria não foi achada no banco,
              // nesse caso é melhor criar um arquivo separado caso queira tentar importar essas que não foram achadas dnv
              if (!success) { return writePortariaPesistence(false, { portaria, alteracoes }, line, data); }
              return writePortariaPesistence(true, { portaria, alteracoes }, line, data);
            })
            .catch((error) => {
              console.log(`Erro ao editar portaria ${portaria?.numero}, ano ${portaria?.ano}`, error);
              return writePortariaPesistence(false, { portaria, alteracoes }, line, data);
            });
        }));
      }
    }
    // console.log(portarias);
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
