<div align="center">

# 🔭 Trelliscope

**An Obsidian-style viewer and navigator for a [Trellis](https://github.com/e-onux/trellis)-governed repository's evidence graph.**

*See the `Source → Decision → Capability` graph your repo already records.*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

<sub>Part of the **VibeCodeGovern** initiative · by **SidreLabs** · [vibecodegovern.com](https://vibecodegovern.com)</sub>

</div>

---

Trellis keeps decisions, sources and capability contracts in your repo and validates the **evidence
graph** that links them. Trelliscope makes that graph *visible*: point it at a Trellis repo and get a
single self-contained HTML app, or an Obsidian vault you can open as-is.

It is a separate tool on purpose — the [Trellis](https://github.com/e-onux/trellis) repository stays the
bare standard + toolchain; Trelliscope is the **viewer**, and reads the graph through
[`@sidrelabs/trellis-core`](https://github.com/e-onux/trellis/tree/main/packages/core).

## Local-only, no network

Trelliscope reads **only** your Trellis governance files (`sources/`, `tech/decisions/`,
`capabilities/*/contract.yaml`) — strictly less than `trellis audit` already reads — and writes the
output you asked for. **No network calls, no telemetry.** The HTML it produces is fully self-contained
and works offline.

## Use

```bash
npx @sidrelabs/trelliscope                          # -> trelliscope.html (open in any browser)
npx @sidrelabs/trelliscope --format obsidian        # -> ./evidence-vault/ (open as an Obsidian vault)
npx @sidrelabs/trelliscope --format json            # the raw { nodes, edges, dangling } graph
npx @sidrelabs/trelliscope --root ../my-project     # render another repo
```

| Format | Output | What it is |
|---|---|---|
| `html` (default) | `trelliscope.html` | One file — inline CSS + vanilla JS, no server, no CDN, no graph library. Sources, decisions and capabilities in columns; hover to highlight links, filter by type, click to inspect. |
| `obsidian` | `evidence-vault/` | One Markdown note per node under `sources/` · `decisions/` · `capabilities/`, cross-linked with `[[wikilinks]]`, plus a `_evidence-graph.md` map-of-content. Open the folder as an Obsidian vault and its graph view shows the evidence graph. |
| `json` | stdout / `--out` | The normalized `{ nodes, edges, dangling }` graph for your own tooling. |

## Library

```js
import { loadEvidenceGraph, renderGraphHtml, renderObsidianVault } from '@sidrelabs/trelliscope';

const graph = loadEvidenceGraph('.');        // read a Trellis repo (via @sidrelabs/trellis-core)
const html = renderGraphHtml(graph);          // -> a complete standalone HTML document (string)
const notes = renderObsidianVault(graph);     // -> [{ path, content }] vault notes
```

`renderGraphHtml` and `renderObsidianVault` are pure and browser-safe; `loadEvidenceGraph` reads the
repository (re-exported from `@sidrelabs/trellis-core`).

## Develop

```bash
npm install        # links @sidrelabs/trellis-core from ../trellis/packages/core (file: dependency)
npm test           # node --test
node bin/trelliscope.js --root ../trellis    # render the Trellis repo's own evidence graph
```

> The `@sidrelabs/trellis-core` dependency is a `file:` path during development; switch it to the
> published `^0.2.0` once `trellis-core` is on npm.

## License

[Apache-2.0](./LICENSE) © SidreLabs.
