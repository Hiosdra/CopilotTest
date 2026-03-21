/**
 * HTML utility functions for report generation
 */

/**
 * Escapes HTML special characters to prevent XSS and ensure proper rendering
 * @param text The text to escape
 * @returns The escaped text safe for HTML rendering
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Calculates the duration in milliseconds between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns Duration in milliseconds
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  return endDate.getTime() - startDate.getTime();
}
