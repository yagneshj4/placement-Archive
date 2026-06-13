/**
 * Utility function to sanitize raw text inputs and prevent Stored XSS.
 * Removes HTML tags, script blocks, inline javascript protocols, and event handlers.
 * 
 * @param {string} str - Raw input text from client
 * @returns {string} Sanitized plain text
 */
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return ''

  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove <script> tags and all code within them
    .replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, '')         // Remove inline event handlers (e.g. onload, onerror, onclick)
    .replace(/javascript:\s*/gi, '')                    // Remove javascript: links
    .replace(/<[^>]+>/g, '')                            // Remove HTML/XML brackets and tags
    .trim()
}
