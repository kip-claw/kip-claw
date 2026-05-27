export type TwitterArchiveData = {
	summary: {
		totalTweets: number;
		totalLikes: number;
		originalTweets: number;
		replies: number;
		firstTweet: string;
		lastTweet: string;
	};
	monthlyTweets: MonthlyTweetCount[];
	topTweets: TopTweet[];
};

export type MonthlyTweetCount = {
	month: string;
	count: number;
};

export type TopTweet = {
	id: string;
	text: string;
	createdAt: string;
	likeCount: number;
	mediaCount: number;
	isReply: boolean;
	media: string[];
};

export function parseTwitterArchiveData(raw: unknown): TwitterArchiveData {
	return raw as TwitterArchiveData;
}
