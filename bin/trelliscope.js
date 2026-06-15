#!/usr/bin/env node
// Trelliscope CLI - render a Trellis-governed repository's evidence graph as a self-contained HTML
// app, an Obsidian vault, or raw JSON. Reads the graph through @sidrelabs/trellis-core.
// Local-only: it reads the repo's governance files and writes output. No network, no telemetry.
import fs from 'node:fs';
import path from 'node:path';
import { loadEvidenceGraph } from '@sidrelabs/trellis-core';
import { renderGraphHtml } from '../src/graph-html.js';
import { renderObsidianVault } from '../src/obsidian-vault.js';

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const bold = c('1'), dim = c('2'), red = c('31'), green = c('32'), yellow = c('33'), cyan = c('36');
const ok = (s) => green(`✓ ${s}`);

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) flags[key] = true;
      else { flags[key] = next; i++; }
    } else positional.push(a);
  }
  return { positional, flags };
}

function pkgVersion() {
  try { return JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version; } catch { return '0.1.0'; }
}

function help() {
  console.log(`
${bold('🔭 trelliscope')} ${dim(pkgVersion())} - view a Trellis repo's evidence graph ${dim('(local-only, no network)')}

${bold('Usage')}
  trelliscope [--format html|json|obsidian] [--out <path>] [--root <dir>]

${bold('Formats')}
  ${cyan('html')}      self-contained interactive viewer (default)        ${dim('-> trelliscope.html')}
  ${cyan('obsidian')}  an Obsidian vault (one note per node, [[wikilinks]]) ${dim('-> ./evidence-vault/')}
  ${cyan('json')}      the raw { nodes, edges, dangling } graph

${bold('Examples')}
  trelliscope                          ${dim('# render the current repo to trelliscope.html')}
  trelliscope --root ../my-project     ${dim('# render another repo')}
  trelliscope --format obsidian --out vault
`);
}

function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--help' || argv[0] === '-h' || argv[0] === 'help') return help();
  if (argv[0] === '--version' || argv[0] === '-v') return console.log(`trelliscope ${pkgVersion()}`);

  const { flags } = parseArgs(argv);
  const repoRoot = path.resolve(flags.root || process.cwd());
  const format = (flags.format || 'html').toLowerCase();

  let graph;
  try { graph = loadEvidenceGraph(repoRoot); }
  catch (e) { console.error(red(`error: ${e.message}`)); process.exit(1); }

  if (format === 'json') {
    const json = JSON.stringify(graph, null, 2);
    if (flags.out) {
      const out = path.resolve(flags.out);
      fs.writeFileSync(out, json + '\n');
      console.log(ok(`Graph JSON → ${path.relative(process.cwd(), out)}`));
    } else console.log(json);
    return;
  }
  if (format === 'html') {
    const out = path.resolve(flags.out || 'trelliscope.html');
    fs.writeFileSync(out, renderGraphHtml(graph, { title: 'Trelliscope - evidence graph' }));
    console.log(ok(`Evidence graph → ${path.relative(process.cwd(), out)}`) + dim(`  ${graph.stats.nodes} nodes, ${graph.stats.edges} links`));
    if (graph.dangling.length) console.log(yellow(`! ${graph.dangling.length} dangling reference(s)`));
    console.log(dim('Open it in any browser - fully self-contained, offline.'));
    return;
  }
  if (format === 'obsidian') {
    const outDir = path.resolve(flags.out || 'evidence-vault');
    const notes = renderObsidianVault(graph);
    for (const note of notes) {
      const dest = path.join(outDir, note.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, note.content);
    }
    console.log(ok(`Obsidian vault → ${path.relative(process.cwd(), outDir)}/`) + dim(`  ${notes.length} notes`));
    console.log(dim('Open the folder as an Obsidian vault; the graph view shows the evidence graph.'));
    return;
  }
  console.error(red(`error: unknown --format "${format}". Choose: html, json, obsidian`));
  process.exit(1);
}

main();
