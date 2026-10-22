# ConectaGerações

Aplicação web do projeto ConectaGerações, com páginas informativas, materiais educativos e uma API servida pelo próprio projeto.

## Tecnologias

- HTML, CSS e JavaScript
- Node.js 18 ou superior
- API HTTP nativa do Node.js, sem dependências externas de runtime

## Estrutura do projeto

```text
conectageracoes/
├── data/
│   └── conteudo.json       # Conteúdo utilizado pela API
├── public/                 # Páginas, estilos, scripts e arquivos estáticos
│   ├── img/                # Logos e imagens
│   ├── grupos/             # Projetos complementares
│   └── artigo-conecta-geracoes.pdf
├── server.js               # Servidor web e rotas da API
├── package.json            # Metadados e comandos do projeto
├── render.yaml             # Configuração de deploy
└── .gitignore
```

## Execução local

Requisitos: Node.js 18 ou superior.

Na pasta do projeto, execute:

```bash
npm start
```

Depois, acesse `http://localhost:3000` no navegador.

## Configuração

O serviço utiliza as seguintes variáveis de ambiente quando aplicável:

- `PORT`: porta HTTP do servidor. Em ambientes de hospedagem, normalmente é definida pela plataforma.
- `TRUST_PROXY`: habilita o tratamento de cabeçalhos de proxy confiáveis.
- `ADMIN_TOKEN`: token utilizado para autorizar operações administrativas.

Não versione tokens, credenciais ou outros segredos no repositório.

## Conteúdo e arquivos estáticos

As páginas e os recursos públicos ficam em `public/`. O conteúdo consumido pela API fica em `data/conteudo.json`.

Para atualizar o PDF do artigo, mantenha o nome `artigo-conecta-geracoes.pdf` e substitua o arquivo correspondente em `public/`. Imagens e outros recursos podem ser atualizados em seus diretórios, preservando os caminhos referenciados pelo site.

## Projetos complementares

Os trabalhos complementares podem ser organizados em subpastas de `public/grupos/`. Cada projeto deve conter sua página inicial e os arquivos de que precisa. Para disponibilizá-lo na página de projetos, adicione o respectivo cartão em `public/projetos.html`.

Projetos que dependam de um servidor, banco de dados ou autenticação próprios devem ser executados separadamente.

## Deploy

O arquivo `render.yaml` contém a configuração do serviço para o Render, incluindo o comando de inicialização e a rota de verificação de saúde (`/api/saude`). Ajustes de ambiente e credenciais devem ser feitos nas configurações do serviço de hospedagem.
