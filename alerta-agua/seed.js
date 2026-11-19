// script para popular o banco com alguns registros de exemplo
// uso: npm run seed  (APAGA as ocorrencias atuais antes de inserir)
const { conectar, ocorrencias } = require('./db');
const { calcularPrioridade } = require('./regras');

const exemplos = [
  ['São Paulo', 'Jardim Pantanal', 'Alagamento', 'Alta', true, '2026-11-02', 'Rio Tietê transbordou e a água entrou nas casas da rua principal.'],
  ['São Paulo', 'Jardim Pantanal', 'Esgoto a céu aberto', 'Média', false, '2026-11-05', 'Esgoto escorrendo pela viela depois da última chuva.'],
  ['São Paulo', 'Itaim Paulista', 'Alagamento', 'Média', false, '2026-11-08', 'Avenida alagada no horário de pico, ônibus não passam.'],
  ['Guarulhos', 'Pimentas', 'Falta de água', 'Alta', true, '2026-11-09', 'Bairro sem água há três dias, caminhão pipa não apareceu.'],
  ['Osasco', 'Rochdale', 'Bueiro entupido', 'Baixa', false, '2026-11-10', 'Bueiro da esquina cheio de lixo, acumula água quando chove.'],
  ['Diadema', 'Eldorado', 'Vazamento na rua', 'Média', false, '2026-11-11', 'Cano estourado jorrando água limpa na calçada desde ontem.'],
  ['Mauá', 'Jardim Zaíra', 'Falta de água', 'Média', true, '2026-11-12', 'Água só chega de madrugada, caixa d\'água não enche.'],
  ['São Paulo', 'Capão Redondo', 'Esgoto a céu aberto', 'Alta', true, '2026-11-13', 'Córrego com esgoto passando do lado das casas, cheiro muito forte.'],
  ['Santo André', 'Vila Luzita', 'Alagamento', 'Baixa', false, '2026-11-14', 'Poça grande na frente da escola sempre que chove.'],
  ['Carapicuíba', 'Cohab', 'Vazamento na rua', 'Baixa', false, '2026-11-15', 'Pequeno vazamento no hidrante da praça.']
];

async function popular() {
  await conectar();

  const documentos = exemplos.map((e) => ({
    cidade: e[0],
    bairro: e[1],
    tipo: e[2],
    gravidade: e[3],
    afetaResidencia: e[4],
    dataOcorrencia: e[5],
    descricao: e[6],
    prioridade: calcularPrioridade(e[2], e[3], e[4]),
    criadoEm: new Date()
  }));

  await ocorrencias().deleteMany({});
  await ocorrencias().insertMany(documentos);
  console.log(documentos.length + ' ocorrências de exemplo inseridas.');
  process.exit(0);
}

popular().catch((err) => {
  console.log('Erro ao popular o banco:', err.message);
  process.exit(1);
});
