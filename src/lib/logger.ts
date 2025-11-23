import { SITE_URL } from 'astro:env/client';
import { createLogger as createWinstonLogger, format, transports } from 'winston';

const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
const gray = (text: string) => `\x1b[90m${text}\x1b[0m`;

export const createLogger = (prefix: string) =>
	createWinstonLogger({
		level: 'info',
		defaultMeta: {
			service: SITE_URL
		},
		format: format.combine(
			format.colorize(),
			format.label({ label: prefix }),
			format.timestamp({ format: 'DD/MM/YY - HH:mm:ss' }),
			format.printf(({ level, message, label, timestamp }) => {
				const coloredLabel = blue(`[${label}]`);
				const grayTimestamp = gray(timestamp as string);
				return `${grayTimestamp} ${coloredLabel} ${level}: ${message}`;
			})
		),
		transports: [new transports.Console()]
	});

export default createLogger('defile-webservice');
