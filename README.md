# Alerta Água

Global Solution 2026.2 - Application Development (Prof. Allan Roberto Molto) - FIAP
Desafio: **CitizenTech**

## Integrantes

| Nome | RM |
|------|----|
| Gabriel Ramos Moreira | RM564074 |
| Vinicius Mello Siqueira | RM565257 |

## Vídeo pitch

Link: https://youtu.be/oKWKkrjnXkI

## O problema

Na Região Metropolitana de São Paulo os problemas ligados à água aparecem o ano inteiro: alagamentos na época de chuva, falta de água no período de seca, vazamentos, bueiros entupidos e esgoto a céu aberto. Quem mais sofre são os moradores de bairros periféricos, e muitas vezes essas reclamações ficam espalhadas em grupos de WhatsApp e não viram informação organizada.

- **Público-alvo:** moradores dos bairros afetados, associações de bairro e equipes da prefeitura / defesa civil.
- **Objetivo:** o morador registra a ocorrência em um formulário simples e o sistema transforma os registros em indicadores (quantos problemas existem, quais tipos são mais comuns, quais são mais urgentes e qual bairro está mais afetado), ajudando a decidir onde agir primeiro.

### ODS relacionados

- **ODS 6 - Água Potável e Saneamento**
- **ODS 11 - Cidades e Comunidades Sustentáveis**

## Tecnologias

HTML, CSS, JavaScript, Node.js, Express e MongoDB (driver oficial `mongodb`).

## Como executar

Pré-requisitos: Node.js 18+ e MongoDB rodando localmente na porta padrão (27017).

```bash
# 1. instalar as dependências
npm install

# 2. (opcional) inserir 10 ocorrências de exemplo - apaga as que já existem
npm run seed

# 3. iniciar o servidor
npm start
```

Depois é só abrir **http://localhost:3000** no navegador.

O banco usado é o `alerta_agua` e a coleção é `ocorrencias` (são criados automaticamente no primeiro cadastro).
Se o MongoDB estiver em outro endereço (ex: Atlas), dá pra passar a URL pela variável `MONGO_URL`:

```bash
MONGO_URL="mongodb+srv://usuario:senha@cluster/..." npm start
```

## Estrutura de pastas

```
alerta-agua/
├── public/
│   ├── css/style.css
│   ├── js/cadastro.js      -> envio do formulário e mensagens
│   ├── js/lista.js         -> listagem, filtros e indicadores
│   ├── index.html          -> introdução + formulário
│   ├── ocorrencias.html    -> indicadores e tabela de registros
│   └── 404.html
├── db.js                   -> conexão com o MongoDB
├── regras.js               -> validação e regra de prioridade
├── seed.js                 -> dados de exemplo
├── server.js               -> servidor Express e rotas
└── package.json
```

## Rotas

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/` | Página com a introdução e o formulário |
| GET | `/ocorrencias` | Página com os indicadores e a lista |
| POST | `/api/ocorrencias` | Valida e salva uma ocorrência no MongoDB |
| GET | `/api/ocorrencias` | Lista as ocorrências (filtros opcionais `?tipo=` e `?prioridade=`) |
| GET | `/api/indicadores` | Retorna os indicadores calculados |
| * | qualquer outra | Página 404 (ou JSON de erro se começar com `/api`) |

## Campos de cada registro

`cidade`, `bairro`, `tipo`, `gravidade`, `dataOcorrencia`, `descricao`, `afetaResidencia` (sim/não).
O servidor ainda grava `prioridade` (calculada) e `criadoEm`.

**Validação no servidor:** bairro com pelo menos 3 letras, cidade/tipo/gravidade precisam estar nas listas permitidas, descrição entre 10 e 500 caracteres e data obrigatória (não pode ser no futuro). Se algo estiver errado a API responde `400` com a lista de erros e a página mostra a mensagem em vermelho; se der certo responde `201` e aparece a mensagem de confirmação.

## Indicadores

1. **Total de ocorrências** - quantidade de documentos na coleção (`countDocuments`).
2. **Resumo por tipo** - agrupamento com `$group` mostrando quantidade e porcentagem de cada tipo (alagamento, falta de água etc.).
3. **Resumo por prioridade** - quantas ocorrências são Urgentes, Moderadas e Baixas, e o percentual de urgentes.
4. **Bairro mais afetado** - bairro (+ cidade) com mais registros.

### Regra de prioridade

Cada ocorrência recebe pontos quando é cadastrada:

| Tipo | Pontos | Gravidade | Pontos |
|------|--------|-----------|--------|
| Alagamento | 3 | Alta | 3 |
| Falta de água | 2 | Média | 2 |
| Esgoto a céu aberto | 2 | Baixa | 1 |
| Vazamento na rua | 1 | | |
| Bueiro entupido | 1 | | |

+1 ponto se o problema está atingindo casas/moradores.

- **6 ou mais** -> Urgente
- **4 ou 5** -> Moderada
- **até 3** -> Baixa

Exemplo: alagamento (3) + gravidade alta (3) = 6 -> Urgente.
