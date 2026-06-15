// Public API for @sidrelabs/trelliscope. Render a Trellis evidence graph as a self-contained HTML
// app or an Obsidian vault. The graph data comes from @sidrelabs/trellis-core (loadEvidenceGraph);
// it is re-exported here so consumers have a one-stop import. Local-only: no network, no telemetry.
export { renderGraphHtml } from './graph-html.js';
export { renderObsidianVault } from './obsidian-vault.js';
export { loadEvidenceGraph, buildEvidenceGraph } from '@sidrelabs/trellis-core';
