import { buildTrmnlDashboard } from '$lib/trmnl';
import type { CronJobSnapshot } from '$lib/cronJobs';
import cronJobNames from '$lib/cronJobNames.json';
import openclawJobs from '$lib/openclawJobs.json';
import piHealth from '$lib/piHealth.json';
import transcription from '$lib/transcriptionDiagnostics.json';
import speedTests from '../../../../static/data/speedTests.json';

export const prerender = true;

export const GET = () =>
	new Response(
		JSON.stringify(
			buildTrmnlDashboard({
				piHealth,
				speedTests,
				cronJobs: openclawJobs as CronJobSnapshot[],
				activeJobNames: cronJobNames,
				transcription
			})
		),
		{
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'cache-control': 'public, max-age=300'
			}
		}
	);
