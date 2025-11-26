/**
 * Replace all newlines with <br> tags.
 * Sometimes needed for gsap split text to work with newlines.
 */
export const nl2br = (text: string) => text.replace(/\n/g, '<br>');
