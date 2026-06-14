<script lang="ts">
	// High-level architecture diagram of Kip's setup and tools.
	// The topology is described as data below; the SVG geometry is computed on the
	// fly with d3 scales and rendered reactively, so the layout reflows (rather
	// than just shrinking) as the available width changes.
	import { scaleBand } from 'd3-scale';
	import { range } from 'd3-array';

	type Interface = { title: string; sub: string };
	type Service = { title: string; subs: string[] };
	type GroupId = 'local' | 'cloud';

	const interfaces: Interface[] = [
		{ title: 'Telegram', sub: 'Chat · Commands' },
		{ title: 'kip.computer', sub: 'Public site · Apps' }
	];

	const groups: { id: GroupId; label: string; items: Service[] }[] = [
		{
			id: 'local',
			label: 'Local network',
			items: [
				{ title: 'NAS', subs: ['Backups · ArchiveBox', 'FileBrowser · Birdclaw'] },
				{ title: 'Kodi', subs: ['Media center'] },
				{ title: 'Whisper', subs: ['Speech to text'] },
				{ title: 'Android phone', subs: ['Termux node'] },
				{ title: 'Obsidian', subs: ['Todo · Memory wiki', 'Work documents'] },
				{ title: 'Sonos', subs: ['Sound system'] },
				{ title: 'Piper', subs: ['Text to speech'] },
				{ title: 'Butterchurn', subs: ['Music visuals'] }
			]
		},
		{
			id: 'cloud',
			label: 'Cloud services',
			items: [
				{ title: 'Cloudflare', subs: ['R2 · Domains · Workers'] },
				{ title: 'Google Sheets', subs: ['Logs · Datasets'] },
				{ title: 'GitHub', subs: ['Site · Skills'] },
				{ title: 'Fastmail', subs: ['Email · Calendar'] },
				{ title: 'Chartbeat', subs: ['Audience analytics'] },
				{ title: 'OpenAI', subs: ['Image generation'] }
			]
		}
	];

	const PAD = 16;
	const BEN_H = 50;
	const IF_H = 50;
	const CORE_H = 82;
	const CARD_H = 72;
	const ROW_GAP = 16;
	const GROUP_GAP = 30;

	// The reasoning model(s) the OpenClaw agent runs on. Designed as a list so a
	// future local Ollama fallback is a one-line addition and the node grows to
	// fit automatically.
	type Model = { name: string; detail?: string };
	const models: Model[] = [{ name: "OpenAI's GPT" }];

	const MODEL_HEAD = 24;
	const MODEL_ROW = 17;
	const MODEL_PAD = 12;
	const modelH = MODEL_HEAD + models.length * MODEL_ROW + MODEL_PAD;

	// Default to a desktop width so the prerendered snapshot is sensible; the
	// bound clientWidth re-measures on the client and the layout reflows.
	let width = $state(1040);

	// Both groups share a column count so their grids stay aligned.
	function columnsFor(w: number): number {
		if (w >= 720) return 4;
		if (w >= 470) return 3;
		if (w >= 320) return 2;
		return 1;
	}

	type Box = { x: number; y: number; w: number; h: number; cx: number };
	type Card = Box & Service & { col: number; group: GroupId };
	type GroupLayout = { id: GroupId; label: string; labelY: number; busY: number; cards: Card[] };
	type Link = { x1: number; y1: number; x2: number; y2: number };

	const layout = $derived.by(() => {
		const W = Math.max(280, Math.round(width));
		const cx = W / 2;
		const cols = columnsFor(W);

		// Ben
		const benW = Math.min(180, W - 2 * PAD);
		const ben: Box = { x: cx - benW / 2, y: PAD, w: benW, h: BEN_H, cx };

		// Interfaces — always paired, width responsive
		const ifGap = 16;
		const ifW = Math.min(190, (W - ifGap - 2 * PAD) / 2);
		const ifLeft = cx - (ifW * 2 + ifGap) / 2;
		const ifY = ben.y + ben.h + 36;
		const ifaces = interfaces.map((d, i) => {
			const x = ifLeft + i * (ifW + ifGap);
			return { ...d, x, y: ifY, w: ifW, h: IF_H, cx: x + ifW / 2 };
		});

		// Core runtime
		const coreW = Math.min(520, W - 2 * PAD);
		const coreY = ifY + IF_H + 38;
		const core: Box = { x: cx - coreW / 2, y: coreY, w: coreW, h: CORE_H, cx };

		// Reasoning model node, on the spine just below the core.
		const modelW = Math.min(300, W - 2 * PAD);
		const modelY = core.y + core.h + 30;
		const model: Box = { x: cx - modelW / 2, y: modelY, w: modelW, h: modelH, cx };

		// Shared column geometry via a d3 band scale
		const band = scaleBand<number>()
			.domain(range(cols))
			.range([PAD, W - PAD])
			.paddingInner(cols > 1 ? 0.16 : 0)
			.paddingOuter(0.04);
		const cardW = band.bandwidth();
		const colX = (c: number) => band(c) ?? 0;
		const colCenter = (c: number) => colX(c) + cardW / 2;

		const links: Link[] = [];
		for (const f of ifaces) links.push({ x1: ben.cx, y1: ben.y + ben.h, x2: f.cx, y2: f.y });
		for (const f of ifaces) links.push({ x1: f.cx, y1: f.y + f.h, x2: core.cx, y2: core.y });
		links.push({ x1: core.cx, y1: core.y + core.h, x2: model.cx, y2: model.y });

		// Lay the groups out, stacked, each with its own label and bus.
		const groupLayouts: GroupLayout[] = [];
		let cursorY = model.y + model.h + 28;
		for (const g of groups) {
			const labelY = cursorY + 12;
			const busY = labelY + 14;
			const cardsY = busY + 16;
			const cards: Card[] = g.items.map((d, i) => {
				const col = i % cols;
				const row = Math.floor(i / cols);
				const x = colX(col);
				const y = cardsY + row * (CARD_H + ROW_GAP);
				return { ...d, x, y, w: cardW, h: CARD_H, cx: x + cardW / 2, col, group: g.id };
			});
			const rows = Math.ceil(g.items.length / cols);

			// Connectors: bus across the group's columns, drops to each card,
			// and inter-row drops within a column.
			if (cols > 1) links.push({ x1: colCenter(0), y1: busY, x2: colCenter(cols - 1), y2: busY });
			const usedCols = Math.min(cols, g.items.length);
			for (let c = 0; c < usedCols; c++) {
				links.push({ x1: colCenter(c), y1: busY, x2: colCenter(c), y2: cardsY });
			}
			for (let i = 0; i < cards.length; i++) {
				const below = cards[i + cols];
				if (below) {
					links.push({ x1: cards[i].cx, y1: cards[i].y + cards[i].h, x2: below.cx, y2: below.y });
				}
			}

			groupLayouts.push({ id: g.id, label: g.label, labelY, busY, cards });
			cursorY = cardsY + rows * CARD_H + (rows - 1) * ROW_GAP + GROUP_GAP;
		}

		// Spine from the model down to the last group's bus.
		const lastBusY = groupLayouts[groupLayouts.length - 1].busY;
		links.push({ x1: model.cx, y1: model.y + model.h, x2: model.cx, y2: lastBusY });

		const H = cursorY - GROUP_GAP + PAD;

		return { W, H, ben, ifaces, core, model, groups: groupLayouts, links };
	});

	const description = `Ben reaches Kip through ${interfaces
		.map((d) => d.title)
		.join(' and ')}, which connect to a Raspberry Pi 4 running the OpenClaw agent on ${models
		.map((d) => d.name)
		.join(' and ')}. From there Kip talks to local network services (${groups[0].items
		.map((d) => d.title)
		.join(', ')}) and cloud services (${groups[1].items.map((d) => d.title).join(', ')}).`;
</script>

<figure class="architecture">
	<div class="canvas" bind:clientWidth={width}>
		<svg
			width={layout.W}
			height={layout.H}
			viewBox={`0 0 ${layout.W} ${layout.H}`}
			role="img"
			aria-labelledby="arch-title"
			aria-describedby="arch-desc"
		>
			<title id="arch-title">How Kip is connected</title>
			<desc id="arch-desc">{description}</desc>

			<g class="link">
				{#each layout.links as l}
					<line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
				{/each}
			</g>

			<g class="node node--person">
				<rect x={layout.ben.x} y={layout.ben.y} width={layout.ben.w} height={layout.ben.h} rx="8" />
				<text class="t-title" x={layout.ben.cx} y={layout.ben.y + 21}>Ben Welsh</text>
				<text class="t-sub" x={layout.ben.cx} y={layout.ben.y + 38}>Owner</text>
			</g>

			{#each layout.ifaces as f}
				<g class="node node--io">
					<rect x={f.x} y={f.y} width={f.w} height={f.h} rx="8" />
					<text class="t-title" x={f.cx} y={f.y + 22}>{f.title}</text>
					<text class="t-sub" x={f.cx} y={f.y + 38}>{f.sub}</text>
				</g>
			{/each}

			<g class="node node--core">
				<rect
					x={layout.core.x}
					y={layout.core.y}
					width={layout.core.w}
					height={layout.core.h}
					rx="10"
				/>
				<text class="t-core-title" x={layout.core.cx} y={layout.core.y + 35}>Openclaw agent</text>
				<text class="t-core-sub" x={layout.core.cx} y={layout.core.y + 58}> Raspberry Pi 4 </text>
			</g>

			<g class="node node--model">
				<rect
					x={layout.model.x}
					y={layout.model.y}
					width={layout.model.w}
					height={layout.model.h}
					rx="8"
				/>
				<text class="t-group t-group--model" x={layout.model.cx} y={layout.model.y + 18}>
					Reasoning model
				</text>
				{#each models as m, i}
					<text
						class="t-sub"
						x={layout.model.cx}
						y={layout.model.y + MODEL_HEAD + 14 + i * MODEL_ROW}
					>
						{m.name}{#if m.detail}<tspan class="t-sub-inline"> · {m.detail}</tspan>{/if}
					</text>
				{/each}
			</g>

			{#each layout.groups as g}
				<text class="t-group t-group--{g.id}" x={PAD} y={g.labelY}>{g.label}</text>
				{#each g.cards as c}
					<g class="node node--{c.group}">
						<rect x={c.x} y={c.y} width={c.w} height={c.h} rx="8" />
						{#if c.subs.length === 2}
							<text class="t-card" x={c.cx} y={c.y + 27}>{c.title}</text>
							<text class="t-sub" x={c.cx} y={c.y + 45}>{c.subs[0]}</text>
							<text class="t-sub" x={c.cx} y={c.y + 61}>{c.subs[1]}</text>
						{:else}
							<text class="t-card" x={c.cx} y={c.y + 31}>{c.title}</text>
							<text class="t-sub" x={c.cx} y={c.y + 50}>{c.subs[0]}</text>
						{/if}
					</g>
				{/each}
			{/each}
		</svg>
	</div>
</figure>

<style>
	.architecture {
		width: 100%;
		margin: var(--space-6) 0 var(--space-8);
	}

	/* Break the diagram out of the reading column to the full content width. */
	@media (min-width: 820px) {
		.architecture {
			width: min(var(--layout-max-width), calc(100vw - var(--layout-gutter)));
		}
	}

	.canvas {
		width: 100%;
	}

	.canvas svg {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.link line {
		stroke: color-mix(in srgb, var(--color-muted) 55%, transparent);
		stroke-width: 1.5;
	}

	.node rect {
		stroke-width: 1.5;
	}

	.node--person rect,
	.node--io rect {
		fill: #fff;
		stroke: var(--color-text);
	}

	.node--core rect {
		fill: var(--color-accent);
		stroke: var(--color-accent);
	}

	.node--model rect {
		fill: color-mix(in srgb, var(--color-accent) 7%, #fff);
		stroke: color-mix(in srgb, var(--color-accent) 45%, var(--color-line));
	}

	.node--local rect {
		fill: color-mix(in srgb, var(--color-accent-secondary) 12%, #fff);
		stroke: color-mix(in srgb, var(--color-accent-secondary) 45%, var(--color-line));
	}

	.node--cloud rect {
		fill: color-mix(in srgb, #3f6896 10%, #fff);
		stroke: color-mix(in srgb, #3f6896 45%, var(--color-line));
	}

	.t-group {
		text-anchor: start;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	.t-group--local {
		fill: var(--color-accent-secondary);
	}

	.t-group--cloud {
		fill: #3f6896;
	}

	.t-group--model {
		text-anchor: middle;
		fill: var(--color-accent);
	}

	.t-sub-inline {
		font-weight: 400;
		fill: var(--color-muted);
	}

	text {
		text-anchor: middle;
		font-family: var(--font-family-sans);
		fill: var(--color-text);
	}

	.t-title {
		font-size: 14px;
		font-weight: 700;
	}

	.t-card {
		font-size: 13px;
		font-weight: 700;
	}

	.t-sub {
		font-size: 10.5px;
		fill: var(--color-muted);
	}

	.t-core-title {
		font-size: 16px;
		font-weight: 800;
		fill: #fff;
	}

	.t-core-sub {
		font-size: 12.5px;
		fill: color-mix(in srgb, #fff 82%, transparent);
	}
</style>
