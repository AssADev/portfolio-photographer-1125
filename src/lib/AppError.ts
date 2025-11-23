import logger from './logger.ts';

/**
 * Simple error class that knows its HTTP status and redirect path
 */
export class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
		public readonly redirectPath: string,
		public readonly originalError?: unknown,
		public readonly context?: Record<string, unknown>
	) {
		super(message);
		this.name = 'AppError';
	}

	/**
	 * Log the error with appropriate level and send to Sentry if needed
	 */
	log() {
		const normalizeError = (err: unknown): Error => {
			if (err instanceof Error) return err;
			try {
				return new Error(typeof err === 'string' ? err : JSON.stringify(err));
			} catch {
				return new Error('Unknown error object');
			}
		};

		const errorForSentry = normalizeError(this.originalError || this);
		const logData = {
			statusCode: this.statusCode,
			redirectPath: this.redirectPath,
			...(this.context || {}),
			error:
				this.originalError instanceof Error
					? {
							name: this.originalError.name,
							message: this.originalError.message,
							stack: this.originalError.stack
						}
					: this.originalError
		};

		const serialized = JSON.stringify(logData);

		if (this.statusCode >= 500) {
			logger.error(`${this.message} - ${serialized}`);
		} else if (this.statusCode === 429) {
			logger.warn(`${this.message} - ${serialized}`);
		} else if (this.statusCode === 401) {
			logger.error(`${this.message} - ${serialized}`);
		} else {
			logger.warn(`${this.message} - ${serialized}`);
		}
	}

	static autoError(e: any, slug?: string, language?: string): AppError {
		if (e instanceof AppError) {
			return e;
		} else if (e?.response?.status && slug && language) {
			// Has HTTP response status, likely a Storyblok API error
			return AppError.storyblokError(slug, language, e);
		} else {
			// Generic server error (content processing, memory issues, unhandled errors, etc.)
			return AppError.serverError(`Error processing page ${slug || 'unknown'} in ${language || 'unknown'}`, e, {
				slug,
				language
			});
		}
	}

	/**
	 * Create a 404 error
	 */
	static notFound(slug: string, language?: string): AppError {
		return new AppError(`Page not found: ${slug}`, 404, '/404', undefined, { slug, language });
	}

	/**
	 * Create a server error (500)
	 */
	static serverError(message: string, originalError?: any, context?: Record<string, unknown>): AppError {
		if (originalError?.name === 'AppError') return originalError;

		return new AppError(message, 500, '/500', originalError, context);
	}

	/**
	 * Create a Storyblok API error with proper status code mapping
	 */
	static storyblokError(slug: string, language: string, originalError: any): AppError {
		if (originalError?.name === 'AppError') return originalError;

		const status = originalError?.response?.status;
		const context = { slug, language, storyblokStatus: status };

		switch (status) {
			case 400:
				return new AppError(
					`The wrong format was sent (e.g., XML instead of JSON) for ${slug} (${language})`,
					400,
					'/500',
					originalError,
					context
				);

			case 401:
				return new AppError(`Invalid API key for ${slug} (${language})`, 401, '/500', originalError, context);

			case 404:
				return AppError.notFound(slug, language);

			case 422:
				return new AppError(
					`The request was unacceptable, often due to missing a required parameter for ${slug} (${language})`,
					422,
					'/500',
					originalError,
					context
				);

			case 429:
				return new AppError(
					`Rate limit exceeded for ${slug} (${language})`,
					429,
					'/500',
					originalError,
					context
				);

			case 500:
			case 502:
			case 503:
			case 504:
				return new AppError(
					`Storyblok server error (${status}) for ${slug} (${language})`,
					status,
					'/500',
					originalError,
					context
				);

			default:
				// Fallback for unknown errors
				return new AppError(
					`Storyblok API error for ${slug} (${language})`,
					502,
					'/500',
					originalError,
					context
				);
		}
	}
}
