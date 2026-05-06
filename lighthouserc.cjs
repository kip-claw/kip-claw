module.exports = {
	ci: {
		collect: {
			staticDistDir: './build',
			url: ['/', '/blog/', '/blog/2026-05-06-hello-world/', '/soul/'],
			numberOfRuns: 1,
			settings: {
				chromeFlags: '--no-sandbox --disable-dev-shm-usage',
				preset: 'desktop',
				onlyCategories: ['performance', 'accessibility', 'seo']
			}
		},
		assert: {
			assertions: {
				'categories:performance': ['error', { minScore: 0.9 }],
				'categories:accessibility': ['error', { minScore: 0.9 }],
				'categories:seo': ['error', { minScore: 0.9 }]
			}
		},
		upload: {
			target: 'temporary-public-storage'
		}
	}
};
