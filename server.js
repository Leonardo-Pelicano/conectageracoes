"use strict";
/**
 * Back end do ConectaGerações — sem banco de dados e sem dependências externas.
 *
 * - Serve as páginas do site (pasta /public)
 * - Expõe o conteúdo do site por API (lido de data/conteudo.json)
 * - Recebe mensagens do "Fale conosco" e grava em data/mensagens.jsonl
 * - Painel de leitura das mensagens protegido por ADMIN_TOKEN
 *
 * Variáveis de ambiente: PORT (3000), ADMIN_TOKEN (opcional), DATA_DIR (./data)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const CONTEUDO_FILE = path.join(DATA_DIR, "conteudo.json");
const MENSAGENS_FILE = path.join(DATA_DIR, "mensagens.jsonl");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const MAX_BODY = 10 * 1024; // 10 KB
const TIPOS = ["duvida", "oficina_parceria", "denuncia_conteudo", "outro"];
const RATE_LIMIT = { max: 5, janelaMs: 10 * 60 * 1000 };

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

/* ---------- utilidades ---------- */

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; " +
    "connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

const GRUPOS_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self' https: data:; script-src 'self' 'unsafe-inline' https:; " +
    "style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; " +
    "font-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https:; " +
    "frame-ancestors 'self'; base-uri 'self'",
};

function cabecalhosDe(caminho) {
  return caminho.startsWith("/grupos/") ? GRUPOS_HEADERS : SECURITY_HEADERS;
}

function enviarJson(res, status, corpo, extra) {
  const dados = JSON.stringify(corpo);
  res.writeHead(
    status,
    Object.assign(
      {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(dados),
        "Cache-Control": "no-store",
      },
      SECURITY_HEADERS,
      extra
    )
  );
  res.end(dados);
}

function erro(res, status, mensagem, extra) {
  enviarJson(res, status, { erro: mensagem }, extra);
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let tamanho = 0;
    let estourou = false;
    const partes = [];
    req.on("data", (c) => {
      if (estourou) return; // descarta o resto; a conexão é encerrada após a resposta 413
      tamanho += c.length;
      if (tamanho > MAX_BODY) {
        estourou = true;
        partes.length = 0;
        reject({ status: 413, mensagem: "Mensagem muito grande." });
        return;
      }
      partes.push(c);
    });
    req.on("end", () => {
      if (estourou) return;
      try {
        const texto = Buffer.concat(partes).toString("utf8");
        resolve(texto ? JSON.parse(texto) : {});
      } catch (_) {
        reject({ status: 400, mensagem: "JSON inválido." });
      }
    });
    req.on("error", () => reject({ status: 400, mensagem: "Falha ao ler a requisição." }));
  });
}

function ipDoCliente(req) {
  // Atrás de proxy/hospedagem, use X-Forwarded-For; caso contrário, o socket.
  const xff = req.headers["x-forwarded-for"];
  if (process.env.TRUST_PROXY === "1" && xff) return String(xff).split(",")[0].trim();
  return req.socket.remoteAddress || "desconhecido";
}

/* ---------- limite de requisições (em memória) ---------- */

const tentativas = new Map(); // ip -> [timestamps]

function excedeuLimite(ip) {
  const agora = Date.now();
  const recentes = (tentativas.get(ip) || []).filter((t) => agora - t < RATE_LIMIT.janelaMs);
  tentativas.set(ip, recentes);
  return recentes.length >= RATE_LIMIT.max;
}

// Só envios válidos gastam a cota: quem erra o formulário não é punido.
function registrarEnvio(ip) {
  const lista = tentativas.get(ip) || [];
  lista.push(Date.now());
  tentativas.set(ip, lista);
}

setInterval(() => {
  const agora = Date.now();
  for (const [ip, ts] of tentativas) {
    const recentes = ts.filter((t) => agora - t < RATE_LIMIT.janelaMs);
    if (recentes.length) tentativas.set(ip, recentes);
    else tentativas.delete(ip);
  }
}, 60 * 1000).unref();

/* ---------- conteúdo (arquivo JSON, cacheado e recarregado se mudar) ---------- */

let cacheConteudo = { mtime: 0, dados: {} };

function carregarConteudo() {
  const stat = fs.statSync(CONTEUDO_FILE);
  if (stat.mtimeMs !== cacheConteudo.mtime) {
    cacheConteudo = {
      mtime: stat.mtimeMs,
      dados: JSON.parse(fs.readFileSync(CONTEUDO_FILE, "utf8")),
    };
  }
  return cacheConteudo.dados;
}

/* ---------- armazenamento de mensagens (JSONL, escrita serializada) ---------- */

let filaEscrita = Promise.resolve();

function salvarMensagem(registro) {
  const linha = JSON.stringify(registro) + "\n";
  filaEscrita = filaEscrita.then(() =>
    fs.promises.appendFile(MENSAGENS_FILE, linha, { encoding: "utf8", mode: 0o600 })
  );
  return filaEscrita.catch((e) => {
    filaEscrita = Promise.resolve(); // não trava a fila após uma falha
    throw e;
  });
}

async function lerMensagens() {
  try {
    const texto = await fs.promises.readFile(MENSAGENS_FILE, "utf8");
    return texto
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        try { return JSON.parse(l); } catch (_) { return null; }
      })
      .filter(Boolean);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

/* ---------- validação ---------- */

function limpar(texto, max) {
  return String(texto == null ? "" : texto)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
const CARTAO_RE = /\b(?:\d[ -]?){13,19}\b/;

function validarMensagem(corpo) {
  const nome = limpar(corpo.nome, 80);
  const email = limpar(corpo.email, 120);
  const tipo = limpar(corpo.tipo, 30) || "duvida";
  const mensagem = limpar(corpo.mensagem, 2000);
  const erros = {};
  if (!TIPOS.includes(tipo)) erros.tipo = "Escolha um tipo de contato válido.";
  if (email && !EMAIL_RE.test(email)) erros.email = "Informe um e-mail válido ou deixe em branco.";
  if (mensagem.length < 10) erros.mensagem = "Escreva uma mensagem com pelo menos 10 caracteres.";
  if (CPF_RE.test(mensagem) || CARTAO_RE.test(mensagem)) {
    erros.mensagem =
      "Por segurança, não envie CPF, números de cartão ou dados bancários. O ConectaGerações nunca pede esses dados.";
  }
  return { ok: Object.keys(erros).length === 0, erros, dados: { nome, email, tipo, mensagem } };
}

/* ---------- rotas da API ---------- */

async function tratarApi(req, res, url) {
  const rota = url.pathname.replace(/\/+$/, "") || "/";
  const metodo = req.method;

  if (rota === "/api/saude" && metodo === "GET") {
    return enviarJson(res, 200, { status: "ok", hora: new Date().toISOString() });
  }

  if (rota === "/api/conteudo" && metodo === "GET") {
    return enviarJson(res, 200, { secoes: Object.keys(carregarConteudo()) });
  }

  const m = rota.match(/^\/api\/conteudo\/([^/]+)$/);
  if (m && metodo === "GET") {
    const dados = carregarConteudo();
    if (!Object.prototype.hasOwnProperty.call(dados, m[1])) return erro(res, 404, "Seção não encontrada.");
    return enviarJson(res, 200, dados[m[1]], { "Cache-Control": "public, max-age=300" });
  }

  if (rota === "/api/mensagens" && metodo === "POST") {
    let corpo;
    try {
      corpo = await lerCorpo(req);
    } catch (e) {
      if (e.status === 413) {
        res.on("finish", () => req.destroy());
        return erro(res, 413, e.mensagem, { Connection: "close" });
      }
      return erro(res, e.status || 400, e.mensagem || "Requisição inválida.");
    }
    if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) {
      return erro(res, 400, "Formato inválido.");
    }
    // Campo-armadilha para robôs (invisível para pessoas): finge sucesso e descarta.
    if (limpar(corpo.website, 200)) return enviarJson(res, 201, { ok: true });

    const v = validarMensagem(corpo);
    if (!v.ok) return enviarJson(res, 422, { erro: "Dados inválidos.", campos: v.erros });

    const ip = ipDoCliente(req);
    if (excedeuLimite(ip)) {
      return erro(res, 429, "Muitas mensagens em pouco tempo. Tente novamente em alguns minutos.", {
        "Retry-After": String(Math.ceil(RATE_LIMIT.janelaMs / 1000)),
      });
    }

    const registro = {
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      ...v.dados,
      lida: false,
    };
    try {
      await salvarMensagem(registro);
      registrarEnvio(ip);
    } catch (e) {
      console.error("Falha ao gravar mensagem:", e.message);
      return erro(res, 500, "Não foi possível enviar agora. Tente novamente mais tarde.");
    }
    return enviarJson(res, 201, { ok: true, id: registro.id });
  }

  if (rota === "/api/admin/mensagens" && metodo === "GET") {
    if (!ADMIN_TOKEN) return erro(res, 404, "Não encontrado.");
    const enviado = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const a = Buffer.from(enviado);
    const b = Buffer.from(ADMIN_TOKEN);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return erro(res, 401, "Não autorizado.", { "WWW-Authenticate": "Bearer" });
    }
    const mensagens = await lerMensagens();
    const tipo = url.searchParams.get("tipo");
    const filtradas = tipo ? mensagens.filter((x) => x.tipo === tipo) : mensagens;
    return enviarJson(res, 200, { total: filtradas.length, mensagens: filtradas.reverse() });
  }

  if (rota.startsWith("/api/")) {
    const existe =
      ["/api/saude", "/api/conteudo", "/api/mensagens", "/api/admin/mensagens"].includes(rota) ||
      /^\/api\/conteudo\//.test(rota);
    return erro(res, existe ? 405 : 404, existe ? "Método não permitido." : "Rota não encontrada.");
  }
}

/* ---------- arquivos estáticos ---------- */

function servirEstatico(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return erro(res, 405, "Método não permitido.", { Allow: "GET, HEAD" });
  }
  let caminho;
  try {
    caminho = decodeURIComponent(url.pathname);
  } catch (_) {
    return erro(res, 400, "Endereço inválido.");
  }
  if (caminho.includes("\0")) return erro(res, 400, "Endereço inválido.");
  if (caminho.endsWith("/")) caminho += "index.html";

  const arquivo = path.normalize(path.join(PUBLIC_DIR, caminho));
  const relativo = path.relative(PUBLIC_DIR, arquivo);
  const ocultoOuFora =
    relativo.startsWith("..") || path.isAbsolute(relativo) || relativo.split(path.sep).some((p) => p.startsWith("."));
  if (ocultoOuFora) return pagina404(res);

  fs.stat(arquivo, (err, stat) => {
    if (err || !stat.isFile()) return pagina404(res);
    const ext = path.extname(arquivo).toLowerCase();
    const tipo = MIME[ext] || "application/octet-stream";
    const cache = ext === ".html" ? "no-cache" : "public, max-age=3600";
    res.writeHead(
      200,
      Object.assign(
        {
          "Content-Type": tipo,
          "Content-Length": stat.size,
          "Cache-Control": cache,
        },
        cabecalhosDe(caminho)
      )
    );
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(arquivo).on("error", () => res.destroy()).pipe(res);
  });
}

function pagina404(res) {
  const html =
    '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Página não encontrada</title>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"></head>' +
    '<body><main class="container" style="padding:64px 0"><h1>Página não encontrada</h1>' +
    '<p>O endereço que você abriu não existe.</p><a class="btn btn-primary" href="/index.html">Voltar ao início</a></main></body></html>';
  res.writeHead(404, Object.assign({ "Content-Type": "text/html; charset=utf-8" }, SECURITY_HEADERS));
  res.end(html);
}

/* ---------- servidor ---------- */

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      await tratarApi(req, res, url);
    } else {
      servirEstatico(req, res, url);
    }
  } catch (e) {
    console.error("Erro inesperado:", e);
    if (!res.headersSent) erro(res, 500, "Erro interno do servidor.");
    else res.end();
  }
});

if (require.main === module) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  carregarConteudo(); // falha cedo se o JSON estiver quebrado
  servidor.listen(PORT, () => {
    console.log(`ConectaGerações no ar: http://localhost:${PORT}`);
    if (!ADMIN_TOKEN) console.log("Aviso: ADMIN_TOKEN não definido — leitura de mensagens pela API desativada.");
  });
}

module.exports = { servidor };
