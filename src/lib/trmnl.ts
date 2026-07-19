import { getLatestSnapshot, type CronJobSnapshot } from './cronJobs';
import { getPiHealthSummary, parsePiHealthData } from './piHealth';
import { getSpeedTestsSummary, type SpeedTest } from './speedTests';
import { getTranscriptionSummary, type TranscriptionDiagnostics } from './transcriptionDiagnostics';

export type TrmnlStatusLevel = 'healthy' | 'warning' | 'critical' | 'unknown';

export type TrmnlDashboard = {
	generated_at: string;
	status: {
		level: TrmnlStatusLevel;
		label: string;
		notices: string[];
	};
	pi: {
		temperature_c: number;
		ram_used_gb: number;
		ram_total_gb: number;
		disk_used_gb: number;
		disk_total_gb: number;
		uptime_days: number;
	} | null;
	internet: {
		download_mbps: number;
		upload_mbps: number;
		tested_at: string;
	} | null;
	jobs: {
		ok_30d: number;
		errors_30d: number;
		recent_critical_failures: string[];
	} | null;
	voice: {
		status: 'online' | 'offline' | 'unknown';
		success_rate_30d: number;
	} | null;
};

type BuildDashboardOptions = {
	now?: Date;
	piHealth: unknown;
	speedTests: unknown;
	cronJobs: CronJobSnapshot[];
	activeJobNames: string[];
	transcription: TranscriptionDiagnostics;
};

const MS_PER_HOUR = 60 * 60 * 1000;
const FRESHNESS = {
	pi: 16 * MS_PER_HOUR,
	internet: 24 * MS_PER_HOUR,
	jobs: 4 * MS_PER_HOUR,
	voice: 4 * MS_PER_HOUR
};

const CRITICAL_JOB_NAMES = new Set([
	'Google Drive sync report',
	'Kip backup',
	'Pi health report',
	'R2 offsite backup',
	'Sluggo encrypted NAS backup',
	'Tailnet sentinel',
	'Whisper transcription service health'
]);

/**
 * Exporters write local, offset-free timestamps on the Pi. GitHub Pages builds
 * in UTC, so a bare ISO timestamp would otherwise shift freshness calculations
 * by four or five hours. Interpret those values in America/New_York.
 */
const toDate = (timestamp: string | undefined) => {
	if (!timestamp) return undefined;
	const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
	if (!match) {
		const date = new Date(timestamp);
		return Number.isNaN(+date) ? undefined : date;
	}

	const [, year, month, day, hour, minute, second = '0'] = match;
	const utcMillis = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
	const localParts = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	})
		.formatToParts(new Date(utcMillis))
		.reduce<Record<string, string>>((parts, part) => {
			if (part.type !== 'literal') parts[part.type] = part.value;
			return parts;
		}, {});
	const easternAsUtc = Date.UTC(
		+localParts.year,
		+localParts.month - 1,
		+localParts.day,
		+localParts.hour,
		+localParts.minute,
		+localParts.second
	);
	return new Date(utcMillis - (easternAsUtc - utcMillis));
};

const isFresh = (date: Date | undefined, now: Date, maximumAge: number) =>
	Boolean(date && +now - +date >= 0 && +now - +date <= maximumAge);

const rounded = (value: number, digits = 1) => Number(value.toFixed(digits));

const statusLabel = (level: TrmnlStatusLevel) => {
	if (level === 'healthy') return 'Healthy';
	if (level === 'warning') return 'Needs attention';
	if (level === 'critical') return 'Critical';
	return 'Unknown';
};

export const buildTrmnlDashboard = ({
	now = new Date(),
	piHealth,
	speedTests,
	cronJobs,
	activeJobNames,
	transcription
}: BuildDashboardOptions): TrmnlDashboard => {
	const pi = getPiHealthSummary(parsePiHealthData(piHealth)).latest;
	const speed = getSpeedTestsSummary(
		Array.isArray(speedTests) ? (speedTests as SpeedTest[]) : []
	).latest;
	const activeJobs = cronJobs.filter((job) => activeJobNames.includes(job.jobName));
	const latestJobs = getLatestSnapshot(activeJobs);
	const latestJobTimestamp = activeJobs.reduce(
		(latest, job) => (job.timestamp > latest ? job.timestamp : latest),
		''
	);
	const health = [...(transcription.health ?? [])]
		.filter((entry): entry is { timestamp: string; outcome?: string; reachable?: boolean } =>
			Boolean(entry && typeof entry === 'object' && 'timestamp' in entry)
		)
		.sort((a, b) => +(toDate(a.timestamp) ?? 0) - +(toDate(b.timestamp) ?? 0))
		.at(-1);
	const transcriptionSummary = getTranscriptionSummary(transcription);

	const notices: string[] = [];
	const staleSources = [
		['Pi diagnostics', toDate(pi?.timestamp), FRESHNESS.pi],
		['Internet test', speed ? toDate(speed.timestamp) : undefined, FRESHNESS.internet],
		['Job report', toDate(latestJobTimestamp), FRESHNESS.jobs],
		['Voice health check', health ? toDate(health.timestamp) : undefined, FRESHNESS.voice]
	].filter(([, date, maximumAge]) => !isFresh(date as Date | undefined, now, maximumAge as number));

	if (staleSources.length > 0) {
		for (const [source] of staleSources) notices.push(`${source} is stale or unavailable`);
	}

	const criticalFailures = latestJobs
		.filter((job) => job.status === 'error' && CRITICAL_JOB_NAMES.has(job.jobName))
		.map((job) => job.jobName);
	const nonCriticalErrors = latestJobs.filter(
		(job) => job.status === 'error' && !CRITICAL_JOB_NAMES.has(job.jobName)
	);

	if (criticalFailures.length > 0) notices.push(...criticalFailures.map((job) => `${job} failed`));
	if (nonCriticalErrors.length > 0)
		notices.push(`${nonCriticalErrors.length} non-critical job failure`);
	if (pi && pi.cpuTempC >= 85)
		notices.push(`Pi temperature is critical (${rounded(pi.cpuTempC)}°C)`);
	else if (pi && pi.cpuTempC >= 80)
		notices.push(`Pi temperature is elevated (${rounded(pi.cpuTempC)}°C)`);
	const diskPercent = pi ? (pi.diskUsedGb / pi.diskTotalGb) * 100 : undefined;
	if (diskPercent && diskPercent >= 90)
		notices.push(`Pi disk is critical (${rounded(diskPercent, 0)}% used)`);
	else if (diskPercent && diskPercent >= 80)
		notices.push(`Pi disk is elevated (${rounded(diskPercent, 0)}% used)`);
	if (health && health.outcome !== 'success')
		notices.push('Voice transcription service is offline');

	const hasCriticalCondition =
		criticalFailures.length > 0 ||
		Boolean(pi && pi.cpuTempC >= 85) ||
		Boolean(diskPercent && diskPercent >= 90) ||
		Boolean(health && health.outcome !== 'success');
	const hasWarningCondition =
		nonCriticalErrors.length > 0 ||
		Boolean(pi && pi.cpuTempC >= 80) ||
		Boolean(diskPercent && diskPercent >= 80);
	const level: TrmnlStatusLevel =
		staleSources.length > 0
			? 'unknown'
			: hasCriticalCondition
				? 'critical'
				: hasWarningCondition
					? 'warning'
					: 'healthy';

	return {
		generated_at: now.toISOString(),
		status: { level, label: statusLabel(level), notices: notices.slice(0, 4) },
		pi: pi
			? {
					temperature_c: rounded(pi.cpuTempC),
					ram_used_gb: rounded(pi.ramUsedMb / 1024),
					ram_total_gb: rounded(pi.ramTotalMb / 1024),
					disk_used_gb: rounded(pi.diskUsedGb),
					disk_total_gb: rounded(pi.diskTotalGb),
					uptime_days: rounded(pi.uptimeDays)
				}
			: null,
		internet: speed
			? {
					download_mbps: rounded(speed.downloadMbps),
					upload_mbps: rounded(speed.uploadMbps),
					tested_at: toDate(speed.timestamp)?.toISOString() ?? speed.timestamp
				}
			: null,
		jobs: latestJobTimestamp
			? {
					ok_30d: latestJobs.filter((job) => job.status === 'ok').length,
					errors_30d: latestJobs.filter((job) => job.status === 'error').length,
					recent_critical_failures: criticalFailures
				}
			: null,
		voice: health
			? {
					status: health.outcome === 'success' && health.reachable !== false ? 'online' : 'offline',
					success_rate_30d: rounded(transcriptionSummary.successRate, 0)
				}
			: null
	};
};

export const trmnlFixtures: Record<TrmnlStatusLevel, Partial<TrmnlDashboard>> = {
	healthy: { status: { level: 'healthy', label: 'Healthy', notices: [] } },
	warning: {
		status: {
			level: 'warning',
			label: 'Needs attention',
			notices: ['Pi temperature is elevated (81°C)']
		}
	},
	critical: {
		status: { level: 'critical', label: 'Critical', notices: ['R2 offsite backup failed'] }
	},
	unknown: {
		status: {
			level: 'unknown',
			label: 'Unknown',
			notices: ['Internet test is stale or unavailable']
		}
	}
};
