const express = require('express');
const path = require('path');
const { conectar, ocorrencias } = require('./db');
const { calcularPrioridade, validarOcorrencia } = require('./regras');

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- paginas ----------

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/ocorrencias', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ocorrencias.html'));
});

// ---------- API ----------

// cadastra uma nova ocorrencia
app.post('/api/ocorrencias', async (req, res) => {
  const dados = req.body;
  const erros = validarOcorrencia(dados);

  if (erros.length > 0) {
    return res.status(400).json({ sucesso: false, erros: erros });
  }

  const afetaResidencia = dados.afetaResidencia === true || dados.afetaResidencia === 'on';

  const novaOcorrencia = {
    bairro: String(dados.bairro).trim(),
    cidade: dados.cidade,
    tipo: dados.tipo,
    gravidade: dados.gravidade,
    afetaResidencia: afetaResidencia,
    descricao: String(dados.descricao).trim(),
    dataOcorrencia: dados.data,
    prioridade: calcularPrioridade(dados.tipo, dados.gravidade, afetaResidencia),
    criadoEm: new Date()
  };

  try {
    const resultado = await ocorrencias().insertOne(novaOcorrencia);
    res.status(201).json({
      sucesso: true,
      mensagem: 'Ocorrência registrada com sucesso! Prioridade: ' + novaOcorrencia.prioridade,
      id: resultado.insertedId
    });
  } catch (err) {
    console.log('Erro ao salvar:', err.message);
    res.status(500).json({ sucesso: false, erros: ['Erro ao salvar no banco de dados.'] });
  }
});

// lista as ocorrencias (da pra filtrar por tipo e prioridade)
app.get('/api/ocorrencias', async (req, res) => {
  const filtro = {};
  if (req.query.tipo) filtro.tipo = req.query.tipo;
  if (req.query.prioridade) filtro.prioridade = req.query.prioridade;

  try {
    const lista = await ocorrencias()
      .find(filtro)
      .sort({ dataOcorrencia: -1, criadoEm: -1 })
      .toArray();
    res.json(lista);
  } catch (err) {
    console.log('Erro ao buscar:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar as ocorrências.' });
  }
});

// indicadores calculados a partir dos registros
app.get('/api/indicadores', async (req, res) => {
  try {
    const total = await ocorrencias().countDocuments();

    const porTipo = await ocorrencias().aggregate([
      { $group: { _id: '$tipo', quantidade: { $sum: 1 } } },
      { $sort: { quantidade: -1 } }
    ]).toArray();

    const porPrioridade = await ocorrencias().aggregate([
      { $group: { _id: '$prioridade', quantidade: { $sum: 1 } } }
    ]).toArray();

    // bairro com mais reclamacoes (junta bairro + cidade pq tem bairro com mesmo nome)
    const bairros = await ocorrencias().aggregate([
      { $group: { _id: { bairro: '$bairro', cidade: '$cidade' }, quantidade: { $sum: 1 } } },
      { $sort: { quantidade: -1 } },
      { $limit: 1 }
    ]).toArray();

    // deixa a prioridade sempre na mesma ordem, mesmo que alguma esteja zerada
    const prioridades = { Urgente: 0, Moderada: 0, Baixa: 0 };
    porPrioridade.forEach((p) => {
      prioridades[p._id] = p.quantidade;
    });

    let bairroMaisAfetado = null;
    if (bairros.length > 0) {
      bairroMaisAfetado = {
        bairro: bairros[0]._id.bairro,
        cidade: bairros[0]._id.cidade,
        quantidade: bairros[0].quantidade
      };
    }

    let percentualUrgente = 0;
    if (total > 0) {
      percentualUrgente = Math.round((prioridades.Urgente / total) * 100);
    }

    res.json({
      total: total,
      porTipo: porTipo.map((t) => ({ tipo: t._id, quantidade: t.quantidade })),
      porPrioridade: prioridades,
      percentualUrgente: percentualUrgente,
      bairroMaisAfetado: bairroMaisAfetado
    });
  } catch (err) {
    console.log('Erro nos indicadores:', err.message);
    res.status(500).json({ erro: 'Erro ao calcular os indicadores.' });
  }
});

// ---------- 404 ----------
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ erro: 'Rota não encontrada.' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// erro generico (ex: JSON mal formatado no body)
app.use((err, req, res, next) => {
  console.log('Erro:', err.message);
  res.status(400).json({ sucesso: false, erros: ['Requisição inválida.'] });
});

// so sobe o servidor depois de conectar no banco
conectar()
  .then(() => {
    app.listen(PORTA, () => {
      console.log('Servidor rodando em http://localhost:' + PORTA);
    });
  })
  .catch((err) => {
    console.log('Não foi possível conectar ao MongoDB:', err.message);
    console.log('Verifique se o MongoDB está rodando.');
    process.exit(1);
  });
