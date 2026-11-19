// listas usadas na validacao e na classificacao das ocorrencias

const CIDADES = [
  'São Paulo', 'Guarulhos', 'Osasco', 'Santo André', 'São Bernardo do Campo',
  'São Caetano do Sul', 'Diadema', 'Mauá', 'Carapicuíba', 'Barueri',
  'Taboão da Serra', 'Mogi das Cruzes', 'Itaquaquecetuba', 'Outra (RMSP)'
];

// peso de cada tipo de problema (quanto maior, mais grave para a populacao)
const TIPOS = {
  'Alagamento': 3,
  'Falta de água': 2,
  'Esgoto a céu aberto': 2,
  'Vazamento na rua': 1,
  'Bueiro entupido': 1
};

const GRAVIDADES = {
  'Baixa': 1,
  'Média': 2,
  'Alta': 3
};

// Regra de prioridade definida pelo grupo:
// pontos = peso do tipo + peso da gravidade (+1 se tiver gente afetada dentro de casa)
// 6 ou mais = Urgente | 4 ou 5 = Moderada | ate 3 = Baixa
function calcularPrioridade(tipo, gravidade, afetaResidencia) {
  let pontos = TIPOS[tipo] + GRAVIDADES[gravidade];
  if (afetaResidencia) {
    pontos = pontos + 1;
  }

  if (pontos >= 6) return 'Urgente';
  if (pontos >= 4) return 'Moderada';
  return 'Baixa';
}

// validacao basica do que veio do formulario
// retorna uma lista de erros (vazia = tudo certo)
function validarOcorrencia(dados) {
  const erros = [];

  const bairro = String(dados.bairro || '').trim();
  const descricao = String(dados.descricao || '').trim();

  if (bairro.length < 3) {
    erros.push('Informe o bairro (mínimo 3 letras).');
  }
  if (!CIDADES.includes(dados.cidade)) {
    erros.push('Selecione uma cidade válida.');
  }
  if (!TIPOS[dados.tipo]) {
    erros.push('Selecione o tipo da ocorrência.');
  }
  if (!GRAVIDADES[dados.gravidade]) {
    erros.push('Selecione a gravidade.');
  }
  if (descricao.length < 10 || descricao.length > 500) {
    erros.push('A descrição deve ter entre 10 e 500 caracteres.');
  }

  if (!dados.data) {
    erros.push('Informe a data da ocorrência.');
  } else {
    const data = new Date(dados.data + 'T00:00:00');
    const hoje = new Date();
    if (isNaN(data.getTime())) {
      erros.push('Data inválida.');
    } else if (data > hoje) {
      erros.push('A data não pode ser no futuro.');
    }
  }

  return erros;
}

module.exports = { CIDADES, TIPOS, GRAVIDADES, calcularPrioridade, validarOcorrencia };
