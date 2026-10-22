# ConectaGerações: site e back-end

Tudo em um só serviço: o Node serve as páginas (pasta `public`), a API (`/api/...`) e recebe as mensagens do "Fale conosco".

```
conectageracoes/
├── server.js          back-end (sem dependências externas)
├── package.json       diz ao servidor como iniciar (npm start)
├── render.yaml        configuração pronta para o Render (grátis)
├── data/conteudo.json conteúdo servido pela API
└── public/            o site (HTML, CSS, JS)
    ├── img/           logo, favicon e ilustrações das páginas (home.jpg, criancas.jpg, idosos.jpg)
    ├── artigo-conecta-geracoes.pdf   PDF baixado na aba Artigo
    └── grupos/        trabalhos dos outros grupos
```

Para trocar o artigo em PDF, substitua `public/artigo-conecta-geracoes.pdf` mantendo o mesmo nome. Para trocar o logo ou as ilustrações, substitua os arquivos de `public/img/` (logo.svg, home.jpg, criancas.jpg, idosos.jpg).

## 1. Testar no seu computador (opcional)

1. Instale o Node.js (versão 18 ou mais nova): https://nodejs.org
2. Abra o terminal dentro da pasta `conectageracoes` e rode: `npm start`
3. Abra http://localhost:3000

## 2. Colocar no GitHub (pelo navegador, sem instalar nada)

1. Crie uma conta em https://github.com e clique em **New repository**.
2. Nome: `conectageracoes`. Marque **Public** (o plano grátis do Render exige repositório que ele consiga acessar; público é o mais simples). Clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**.
4. Abra a pasta `conectageracoes` no seu computador, selecione **todo o conteúdo** (server.js, package.json, render.yaml, README.md, as pastas `data` e `public`) e arraste para a janela do GitHub. Importante: arraste o conteúdo da pasta, não a pasta em si, para que `server.js` fique na raiz do repositório.
5. Espere terminar o envio e clique em **Commit changes**.

## 3. Publicar no Render (grátis, sem cartão)

1. Crie uma conta em https://render.com entrando com o GitHub.
2. Clique em **New +** e depois em **Blueprint**. Escolha o repositório `conectageracoes`. O Render lê o `render.yaml` e já preenche tudo.
3. Clique em **Apply**. Espere o status ficar **Live** (alguns minutos).
4. O endereço aparece no topo da página do serviço, no formato `https://conectageracoes.onrender.com` (se o nome já estiver ocupado, o Render coloca um sufixo). Esse é o link para compartilhar.

Se preferir sem Blueprint: **New + > Web Service**, escolha o repositório, Runtime **Node**, Build Command `npm install`, Start Command `npm start`, plano **Free**, e em **Environment** crie `TRUST_PROXY` = `1` e `ADMIN_TOKEN` = uma senha longa sua.

## 4. Limites do plano grátis (importante)

- Depois de 15 minutos sem acessos o serviço "dorme". O primeiro acesso seguinte demora cerca de 1 minuto para acordar. Abra o link alguns minutos antes de apresentar.
- O disco é temporário: as mensagens do "Fale conosco" somem quando o serviço reinicia, dorme ou é atualizado. Leia as mensagens logo depois de chegarem ou combine com o grupo de usar um banco depois.
- O plano grátis tem um limite mensal de horas ligado; para um trabalho acadêmico costuma bastar.

## 5. Ler as mensagens recebidas

O Render criou o `ADMIN_TOKEN` sozinho: no painel do serviço, abra **Environment** e clique no olho ao lado de `ADMIN_TOKEN` para ver o valor.

No Windows (PowerShell), troque SEU_LINK e SEU_TOKEN:

```
Invoke-RestMethod -Uri "https://SEU_LINK.onrender.com/api/admin/mensagens" -Headers @{Authorization="Bearer SEU_TOKEN"}
```

No Mac/Linux:

```
curl -H "Authorization: Bearer SEU_TOKEN" https://SEU_LINK.onrender.com/api/admin/mensagens
```

## 6. Integrar os trabalhos dos outros grupos

1. Peça a cada grupo uma pasta com o site deles (HTML/CSS/JS e imagens), com `index.html` dentro e caminhos relativos (por exemplo `css/estilo.css`, nunca `C:\...`).
2. Coloque em `public/grupos/NOME-DO-GRUPO/` (sem espaços nem acentos). O endereço fica `https://SEU_LINK/grupos/NOME-DO-GRUPO/`.
3. Para aparecer no site, crie um cartão em `public/projetos.html`, dentro de uma `<div class="grid grid-3">`:

```
<div class="card reveal">
  <span class="badge badge-blue">Grupo X</span>
  <h3 style="margin-top:10px;">Nome do trabalho</h3>
  <p>Uma frase explicando o que é.</p>
  <a class="card-arrow" href="grupos/NOME-DO-GRUPO/index.html">Abrir trabalho →</a>
</div>
```

4. Suba as mudanças no GitHub (Add file > Upload files, mantendo as pastas). O Render publica sozinho.

Dentro de `/grupos/` o servidor aceita scripts e estilos embutidos e bibliotecas de https (CDN), coisa que o resto do site bloqueia por segurança. Trabalhos que precisam de back-end próprio (banco, login) não rodam aqui e precisam ser hospedados à parte, com um link.

## 7. Endereço próprio e Google

- Grátis: o endereço `onrender.com` acima. Domínios `.com.br` e `.com` são pagos (a partir de uns R$ 40 por ano). Se você tiver e-mail de estudante, vale conferir o GitHub Student Developer Pack, que costuma incluir domínio grátis por um tempo. Com um domínio, o Render permite conectá-lo nas configurações do serviço, em **Custom Domains**, com HTTPS grátis.
- Para aparecer na busca do Google: entre em https://search.google.com/search-console, adicione o endereço do site e peça a indexação da página inicial. Pode levar de dias a semanas.
