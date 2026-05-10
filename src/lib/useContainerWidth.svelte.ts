export const createContainerWidth = () => {
	let width = $state(0);

	const action = (node: HTMLElement) => {
		width = node.clientWidth;
		const observer = new ResizeObserver((entries) => {
			const w = entries[0]?.contentRect.width ?? 0;
			if (w > 0) width = w;
		});
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	};

	return {
		get width() {
			return width;
		},
		action
	};
};
