const corpoTabela = document.getElementById('corpoTabela');
const filtroTipo = document.getElementById('filtroTipo');
const filtroPrioridade = document.getElementById('filtroPrioridade');
const mensagemLista = document.getElementById('mensagemLista');

// converte 2026-11-18 para 18/11/2026
function formatarData(dataTexto) {
  const partes = dataTexto.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// cria uma celula usando textContent pra nao executar html digitado pelo usuario
function criarCelula(texto, classe) {
  const td = document.createElement('td');
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}

async function carregarIndicadores() {
  try {
    const resposta = await fetch('/api/indicadores');
    const ind = await resposta.json();

    document.getElementById('indTotal').textContent = ind.total;
    document.getElementById('indUrgente').textContent = ind.porPrioridade.Urgente;
    document.getElementById('indPercentual').textContent = ind.percentualUrgente;

    if (ind.bairroMaisAfetado) {
      document.getElementById('indBairro').textContent = ind.bairroMaisAfetado.bairro;
      document.getElementById('indBairroLegenda').textContent =
        ind.bairroMaisAfetado.cidade + ' - ' + ind.bairroMaisAfetado.quantidade + ' ocorrência(s)';
    }

    if (ind.total === 0) return;

    // resumo por tipo com uma barrinha proporcional
    const divTipo = document.getElementById('resumoTipo');
    divTipo.innerHTML = '';
    ind.porTipo.forEach((item) => {
      const porcentagem = Math.round((item.quantidade / ind.total) * 100);
      const linha = document.createElement('div');
      linha.className = 'barra-linha';
      linha.innerHTML =
        '<span class="barra-nome">' + item.tipo + '</span>' +
        '<div class="barra"><div class="barra-preenchida" style="width:' + porcentagem + '%"></div></div>' +
        '<span class="barra-valor">' + item.quantidade + ' (' + porcentagem + '%)</span>';
      divTipo.appendChild(linha);
    });

    const divPrioridade = document.getElementById('resumoPrioridade');
    divPrioridade.innerHTML = '';
    for (const nome in ind.porPrioridade) {
      const qtd = ind.porPrioridade[nome];
      const p = document.createElement('p');
      p.className = 'item-prioridade';
      p.innerHTML = '<span class="tag ' + nome.toLowerCase() + '">' + nome + '</span> ' + qtd + ' ocorrência(s)';
      divPrioridade.appendChild(p);
    }
  } catch (err) {
    console.log(err);
  }
}

async function carregarOcorrencias() {
  let url = '/api/ocorrencias?';
  if (filtroTipo.value) url += 'tipo=' + encodeURIComponent(filtroTipo.value) + '&';
  if (filtroPrioridade.value) url += 'prioridade=' + encodeURIComponent(filtroPrioridade.value);

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error('erro na resposta');
    const lista = await resposta.json();

    corpoTabela.innerHTML = '';
    mensagemLista.className = 'mensagem escondido';

    if (lista.length === 0) {
      const tr = document.createElement('tr');
      const td = criarCelula('Nenhuma ocorrência encontrada.', 'vazio');
      td.colSpan = 6;
      tr.appendChild(td);
      corpoTabela.appendChild(tr);
      return;
    }

    lista.forEach((oc) => {
      const tr = document.createElement('tr');
      tr.appendChild(criarCelula(formatarData(oc.dataOcorrencia)));
      tr.appendChild(criarCelula(oc.bairro + ' - ' + oc.cidade));
      tr.appendChild(criarCelula(oc.tipo));
      tr.appendChild(criarCelula(oc.gravidade));

      const tdPrioridade = document.createElement('td');
      const tag = document.createElement('span');
      tag.className = 'tag ' + oc.prioridade.toLowerCase();
      tag.textContent = oc.prioridade;
      tdPrioridade.appendChild(tag);
      tr.appendChild(tdPrioridade);

      let descricao = oc.descricao;
      if (oc.afetaResidencia) descricao += ' (atinge moradias)';
      tr.appendChild(criarCelula(descricao, 'descricao'));

      corpoTabela.appendChild(tr);
    });
  } catch (err) {
    mensagemLista.className = 'mensagem erro';
    mensagemLista.textContent = 'Erro ao carregar as ocorrências. Verifique se o servidor está rodando.';
  }
}

filtroTipo.addEventListener('change', carregarOcorrencias);
filtroPrioridade.addEventListener('change', carregarOcorrencias);

carregarIndicadores();
carregarOcorrencias();
