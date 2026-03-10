/**
 * Input sanitization for all create/update operations.
 * - Strips read-only fields (id, createdAt, etc.)
 * - Converts date strings to ISO
 * - Auto-generates slugs
 * - Sanitizes HTML content to prevent XSS
 */
import sanitizeHtml from 'sanitize-html';

const STRIP_FIELDS = ['id', 'createdAt', 'updatedAt', '_count', 'album', 'event', 'results'];
const DATE_FIELDS = ['date', 'startDate', 'endDate'];
const HTML_FIELDS = ['content']; // Fields that allow safe HTML
const JSON_FIELDS = ['gallery']; // Fields stored as JSON arrays
const NULLABLE_FIELDS = [
  'subtitle', 'link', 'excerpt', 'bio', 'description', 'content',
  'location', 'endDate', 'thumbnail', 'cover', 'url', 'category',
  'medal', 'photo', 'title', 'score',
];

// Allowed HTML tags and attributes for content fields
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'b', 'i', 'strong', 'em', 'u', 's', 'sub', 'sup',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'figure', 'figcaption',
    'div', 'span',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'loading'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Strip all event handlers, javascript: URLs, data: URLs
  disallowedTagsMode: 'discard',
  // Force rel=noopener on links
  transformTags: {
    'a': (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: 'noopener noreferrer',
        target: attribs.target || '_blank',
      },
    }),
  },
};

function generateSlug(title?: string): string {
  const base = (title || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return base ? `${base}-${suffix}` : suffix;
}

/** Strip XSS from plain text fields (no HTML allowed) */
function sanitizePlainText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeInput<T = any>(data: Record<string, any>): T {
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (STRIP_FIELDS.includes(key)) continue;
    if (value === undefined) continue;

    // Convert date fields
    if (DATE_FIELDS.includes(key) && typeof value === 'string' && value) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        clean[key] = new Date(value + 'T00:00:00.000Z').toISOString();
        continue;
      }
      try {
        clean[key] = new Date(value).toISOString();
      } catch {
        clean[key] = value;
      }
      continue;
    }

    // Pass through JSON array fields as-is (already arrays or will be stored as JSON)
    if (JSON_FIELDS.includes(key)) {
      clean[key] = Array.isArray(value) ? value : [];
      continue;
    }

    // Sanitize HTML content fields
    if (HTML_FIELDS.includes(key) && typeof value === 'string') {
      clean[key] = sanitizeHtml(value, SANITIZE_OPTIONS);
      continue;
    }

    // Convert empty strings to null for nullable fields
    if (value === '' && NULLABLE_FIELDS.includes(key)) {
      clean[key] = null;
      continue;
    }
    if (value === '' && DATE_FIELDS.includes(key)) {
      clean[key] = null;
      continue;
    }

    // Sanitize string values (plain text — no HTML)
    if (typeof value === 'string' && !HTML_FIELDS.includes(key)) {
      clean[key] = sanitizePlainText(value);
      continue;
    }

    clean[key] = value;
  }

  // Auto-generate slug if missing
  if ('slug' in data && (!clean.slug || clean.slug === '')) {
    clean.slug = generateSlug(clean.title as string);
  }

  return clean as T;
}
