import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const CLI = path.resolve('seven/scripts/seven.mjs');
// URL inalcançável: nenhum destes testes pode chegar a fazer requisição
const ENV = { ...process.env, SEVEN_URL: 'http://127.0.0.1:9', SEVEN_TOKEN: 'seven_teste' };

function run(args, env = ENV) {
  const res = spawnSync(process.execPath, [CLI, ...args], { env, encoding: 'utf8' });
  return { code: res.status, out: JSON.parse(res.stdout || '{}') };
}

test('sem SEVEN_URL/SEVEN_TOKEN explica onde configurar', () => {
  const env = { ...process.env };
  delete env.SEVEN_URL;
  delete env.SEVEN_TOKEN;
  const { code, out } = run(['list'], env);
  assert.equal(code, 1);
  assert.match(out.error, /SEVEN_URL e SEVEN_TOKEN/);
});

test('pasta sem index.html é recusada antes de enviar', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seven-cli-'));
  fs.writeFileSync(path.join(dir, 'outra.html'), '<p>x</p>');
  const { code, out } = run(['publish', dir, '--slug', 'x', '--title', 'X']);
  assert.equal(code, 1);
  assert.equal(out.error, `index.html não encontrado em ${dir}.`);
});

test('arquivo acima de 50 MB é recusado localmente', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'seven-cli-')), 'grande.html');
  fs.writeFileSync(file, Buffer.alloc(50 * 1024 * 1024 + 1, 'a'));
  const { code, out } = run(['publish', file, '--slug', 'x', '--title', 'X']);
  assert.equal(code, 1);
  assert.equal(out.error, 'Arquivo maior que 50 MB.');
});

test('publish sem --slug é recusado', () => {
  const { code, out } = run(['publish', '.']);
  assert.equal(code, 1);
  assert.match(out.error, /--slug/);
});
