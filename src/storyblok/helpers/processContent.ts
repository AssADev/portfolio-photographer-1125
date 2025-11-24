import { AppError } from '#lib/AppError.ts';
import { type ResolveData, resolveContent } from '#tools/resolveData.ts';

/**
 * Unified content processor that handles multiple transformations in a single pass:
 * 1. Resolve fields
 * 2. Resolve components
 *
 * @param content - The content object or array to process
 * @param language - The target language code
 * @param options - Configuration options for processing
 */
export default async function processContent({ content, ...rest }: ResolveData): Promise<void> {
	// Skip null or undefined content
	if (content == null) return;

	// Handle arrays by processing each item :
	if (Array.isArray(content)) {
		for (let i = 0; i < content.length; i++) await processContent({ content: content[i], ...rest });
		return;
	}

	// Skip non-objects :
	if (typeof content !== 'object') return;

	try {
		// Don't process resolved links stories :
		if (content.linktype !== 'story') {
			for (const key in content) {
				if (Object.prototype.hasOwnProperty.call(content, key)) {
					await processContent({ content: content[key], ...rest });
				}
			}
		}

		await resolveContent({ content, ...rest });
	} catch (error) {
		throw AppError.serverError('Error processing content', error);
	}
}
