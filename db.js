// conexao com o MongoDB
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const NOME_BANCO = 'alerta_agua';

const client = new MongoClient(MONGO_URL);
let db;

async function conectar() {
  await client.connect();
  db = client.db(NOME_BANCO);
  console.log('Conectado ao MongoDB - banco ' + NOME_BANCO);
}

// retorna a colecao de ocorrencias
function ocorrencias() {
  return db.collection('ocorrencias');
}

module.exports = { conectar, ocorrencias };
