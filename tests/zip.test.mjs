import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import { collectFiles, createZip } from '../seven/scripts/zip.mjs';

function makeProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seven-zip-'));
  const write = (rel, content) => {
    const full = path.join(dir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  write('index.html', '<h1>oi</h1>');
  write('assets/css/a.css', 'body{color:red}');
  write('.env', 'SECRET=1');
  write('.git/x', 'git');
  write('node_modules/y/z.js', 'module');
  return dir;
}

test('collectFiles ignora ocultos, .env, .git e node_modules e usa barras normais', () => {
  const files = collectFiles(makeProject());
  assert.deepEqual(files.map((f) => f.path).sort(), ['assets/css/a.css', 'index.html']);
});

test('createZip gera um zip válido com os caminhos e conteúdos', async () => {
  const zip = await JSZip.loadAsync(createZip(collectFiles(makeProject())));
  const names = Object.keys(zip.files).filter((p) => !zip.files[p].dir).sort();
  assert.deepEqual(names, ['assets/css/a.css', 'index.html']);
  assert.equal(await zip.file('index.html').async('string'), '<h1>oi</h1>');
  assert.equal(await zip.file('assets/css/a.css').async('string'), 'body{color:red}');
});
