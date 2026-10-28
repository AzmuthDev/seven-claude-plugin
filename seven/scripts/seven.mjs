#!/usr/bin/env node
// CLI do plugin Seven para o Claude Code.
//   node seven.mjs list
//   node seven.mjs publish <pasta|arquivo.html> --slug <slug> [--title <t>] [--description <d>]
// Lê SEVEN_URL e SEVEN_TOKEN do ambiente. Saída sempre em JSON; erro → código 1. Nunca imprime o token.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { collectFiles, createZip } from './zip.mjs';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

function fail(error, status) {
  console.log(JSON.stringify(status ? { error, status } : { error }, null, 2));
  process.exit(1);
}

function getConfig() {
  const url = (process.env.SEVEN_URL || '').replace(/\/+$/, '');
  const token = process.env.SEVEN_TOKEN || '';
  if (!url || !token) {
    fail(
      'Configure SEVEN_URL e SEVEN_TOKEN no env do ~/.claude/settings.json (gere o token em Perfil → Integrações no Seven).'
    );
  }
  return { url, token };
}

async function request(method, urlPath, body) {
  const { url, token } = getConfig();
  let res;
  try {
    res = await fetch(`${url}${urlPath}`, { method, headers: { Authorization: `Bearer ${token}` }, body });
  } catch (err) {
    fail(`Não foi possível conectar ao Seven em ${url}: ${err.cause?.code || err.message}`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(data.error || `Erro HTTP ${res.status}`, res.status);
  console.log(JSON.stringify(data, null, 2));
}

function buildUpload(target) {
  if (!fs.existsSync(target)) fail(`Caminho não encontrado: ${target}.`);

  if (fs.statSync(target).isDirectory()) {
    if (!fs.existsSync(path.join(target, 'index.html'))) fail(`index.html não encontrado em ${target}.`);
    return { data: createZip(collectFiles(target)), name: 'site.zip', type: 'application/zip' };
  }

  if (!/\.html?$/i.test(target)) fail('Envie uma pasta com index.html ou um arquivo .html.');
  return { data: fs.readFileSync(target), name: path.basename(target), type: 'text/html' };
}

async function publish(target, values) {
  if (!values.slug) fail('Informe o slug com --slug <slug>.');
  getConfig();

  const upload = buildUpload(target);
  if (upload.data.length > MAX_UPLOAD_BYTES) fail('Arquivo maior que 50 MB.');

  const form = new FormData();
  form.append('file', new Blob([upload.data], { type: upload.type }), upload.name);
  if (values.title) form.append('title', values.title);
  if (values.description) form.append('description', values.description);

  await request('PUT', `/api/integrations/landing-pages/${encodeURIComponent(values.slug)}`, form);
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      slug: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
    },
  });
  const [command, target] = positionals;

  if (command === 'list') return request('GET', '/api/integrations/landing-pages');
  if (command === 'publish') {
    if (!target) fail('Informe a pasta ou o arquivo .html: publish <caminho> --slug <slug>.');
    return publish(target, values);
  }
  fail('Uso: seven.mjs list | seven.mjs publish <pasta|arquivo.html> --slug <slug> [--title <t>] [--description <d>]');
}

main();
