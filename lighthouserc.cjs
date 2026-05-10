module.exports = {
	ci: {
		collect: {
			staticDistDir: './build',
			url: [
				'/',
				'/blog/',
				'/blog/2026-05-06-hello-world/',
				'/apps/',
				'/apps/humidor/',
				'/apps/runs/',
				'/apps/nyc/',
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
				'categories:seo': ['error', { minScore: 0.5I  }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
