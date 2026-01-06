/**
 * Format a date string to French format
 * @param dateString - ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string in French
 */
export const formatDateForSubmission = (dateString: string, includeTime: boolean = false): string => {
	if (!dateString) return dateString;

	const locale = 'fr-FR';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;

	// Format date part :
	const dayName = date.toLocaleDateString(locale, { weekday: 'long' });
	const day = date.getDate();
	const month = date.toLocaleDateString(locale, { month: 'long' });
	const year = date.getFullYear();

	let formatted = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} ${month} ${year}`;

	// Add time if needed :
	if (includeTime) {
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		formatted += ` à ${hours}h${minutes}`;
	}

	return formatted;
};

/**
 * Format a date string to "Month Year" format
 * @param dateString - ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
 * @param locale - The locale to use (e.g., 'fr', 'en')
 * @returns Formatted date string (e.g., "Décembre 2025" or "December 2025")
 */
export const formatDateMonthYear = (dateString: string, locale: string = 'fr'): string => {
	if (!dateString) return dateString;

	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;

	const month = date.toLocaleDateString(locale, { month: 'long' });
	const year = date.getFullYear();

	const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
	return `${formattedMonth} ${year}`;
};
