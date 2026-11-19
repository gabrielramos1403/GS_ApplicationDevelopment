const form = document.getElementById('formOcorrencia');
const divMensagem = document.getElementById('mensagem');
const campoDescricao = document.getElementById('descricao');
const contador = document.getElementById('contador');
const btnEnviar = document.getElementById('btnEnviar');

// nao deixa escolher data no futuro
document.getElementById('data').max = new Date().toISOString().split('T')[0];

campoDescricao.addEventListener('input', () => {
  contador.textContent = campoDescricao.value.length + '/500';
});

function mostrarMensagem(texto, tipo) {
  divMensagem.className = 'mensagem ' + tipo;
  divMensagem.innerHTML = texto;
  divMensagem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    cidade: form.cidade.value,
    bairro: form.bairro.value,
    tipo: form.tipo.value,
    gravidade: form.gravidade.value,
    data: form.data.value,
    descricao: form.descricao.value,
    afetaResidencia: form.afetaResidencia.checked
  };

  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  try {
    const resposta = await fetch('/api/ocorrencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const json = await resposta.json();

    if (resposta.ok) {
      mostrarMensagem(json.mensagem + ' <a href="/ocorrencias">Ver ocorrências</a>', 'sucesso');
      form.reset();
      contador.textContent = '0/500';
    } else {
      // monta a lista de erros que o servidor devolveu
      let html = '<strong>Não foi possível registrar:</strong><ul>';
      json.erros.forEach((erro) => {
        html += '<li>' + erro + '</li>';
      });
      html += '</ul>';
      mostrarMensagem(html, 'erro');
    }
  } catch (err) {
    mostrarMensagem('Erro de conexão com o servidor. Tente novamente.', 'erro');
  }

  btnEnviar.disabled = false;
  btnEnviar.textContent = 'Enviar ocorrência';
});
