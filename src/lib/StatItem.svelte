<script lang="ts">
	type Props = {
		label: string;
		value: string | number;
		unit?: string;
	};

	let { label, value, unit }: Props = $props();
</script>

<div class="stat-item">
	<p class="label">{label}</p>
	<p class="value">
		{value}
		{#if unit}
			<span>{unit}</span>
		{/if}
	</p>
</div>

<style>
	.stat-item {
		min-width: 0;
	}

	p.label {
		margin: 0 0 var(--space-1);
		color: var(--color-muted);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
	}

	p.value {
		margin: 0;
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-snug);
		font-variant-numeric: tabular-nums;
	}

	p.value span {
		color: var(--color-muted);
		font-size: var(--font-size-sm);
		font-weight: 600;
	}
</style>
