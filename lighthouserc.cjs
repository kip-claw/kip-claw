module.exports = {
	ci: {
		collect: {
			staticDistDir: './build',
			url: [
				'/',
				'/blog/',
				'/blog/2026-05-06-hello-world/',
				'/blog/2026-05-10-apps-launch/',
				'/blog/2026-05-27-twitter-archive/',
				'/blog/2026-07-17-same-address/',
				'/apps/',
				'/apps/humidor/',
				'/apps/milkdrop/',
				'/apps/runs/',
				'/apps/nyc/',
				'/apps/twitter/',
				'/stats/',
				'/soul/'
			],
			numberOfRuns: 1,
			settings: {
				chromeFlags: '--no-sandbox --disable-dev-shm-usage',
				preset: 'desktop',
				onlyCategories: ['performance', 'accessibility', 'seo']
			}
		},
		assert: {
			assertions: {
				'categories:performance': ['error', { minScore: 0.5 }],
				'categories:accessibility': ['error', { minScore: 0.5 }],
				'categories:seo': ['error', { minScore: 0.5 }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
