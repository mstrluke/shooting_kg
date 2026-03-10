/**
 * Import data from shooting.kg WordPress site.
 * SANITIZES all content to remove XSS, malicious scripts, and spam.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WP = 'https://shooting.kg/wp-json/wp/v2';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

async function wpFetch(endpoint: string) {
  const res = await fetch(`${WP}/${endpoint}`, { headers: { 'User-Agent': UA } });
  return res.json();
}

// ==================== SANITIZATION ====================

/** Strip ALL HTML tags, scripts, event handlers — returns plain text */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#171;/g, '«')
    .replace(/&#187;/g, '»')
    .replace(/&#\d+;/g, '')
    .trim();
}

/** Sanitize HTML — keep safe tags only, strip all JS/events/iframes */
function sanitizeHtml(html: string): string {
  if (!html) return '';

  let clean = html
    // Remove script/style/iframe/object/embed/form tags entirely
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<iframe[^>]*\/?>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*\/?>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '')
    .replace(/<textarea[\s\S]*?<\/textarea>/gi, '')
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*\S+/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    // Remove data: URLs (potential XSS vector)
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')
    // Remove base64 in attributes
    .replace(/expression\s*\([^)]*\)/gi, '')
    // Remove CSS expressions
    .replace(/style\s*=\s*["'][^"']*expression[^"']*["']/gi, '')
    // Remove vbscript
    .replace(/vbscript\s*:/gi, '')
    // Remove wordpress figure/figcaption with classes but keep content
    .replace(/<figure[^>]*>/gi, '<figure>')
    .replace(/<figcaption[^>]*>/gi, '<figcaption>')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Remove any remaining suspicious patterns
  clean = clean.replace(/<[^>]*(?:eval|alert|confirm|prompt|document\.|window\.)\([^>]*>/gi, '');

  return clean;
}

/** Check if text is spam (Hebrew, Chinese gambling, escort, etc.) */
function isSpam(text: string): boolean {
  const spamPatterns = [
    /[\u0590-\u05FF]{3,}/,      // Hebrew
    /casino|gambling|escort|porn|sex|viagra|cialis/i,
    /паркан|інтер'єр|бетонн/i,  // Ukrainian construction spam
    /онлайн.?казино|ставк/i,    // Russian gambling spam
    /купить|заказать.*дешево/i,  // Russian commerce spam
  ];
  return spamPatterns.some(p => p.test(text));
}

/** Make a safe slug */
function safeSlug(text: string, id: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^\w\sа-яёА-ЯЁ-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
  return base || `post-${id}`;
}

// ==================== IMPORT ====================

async function importPosts() {
  console.log('Fetching posts from WP...');

  // Fetch all posts (paginated)
  let allPosts: any[] = [];
  let page = 1;
  while (true) {
    const posts = await wpFetch(`posts?per_page=100&page=${page}&_fields=id,title,content,excerpt,date,slug,featured_media`);
    if (!Array.isArray(posts) || posts.length === 0) break;
    allPosts = allPosts.concat(posts);
    page++;
    if (posts.length < 100) break;
  }
  console.log(`Fetched ${allPosts.length} total posts`);

  // Fetch media map
  let mediaMap: Record<number, string> = {};
  page = 1;
  while (true) {
    const media = await wpFetch(`media?per_page=100&page=${page}&_fields=id,source_url`);
    if (!Array.isArray(media) || media.length === 0) break;
    for (const m of media) mediaMap[m.id] = m.source_url;
    page++;
    if (media.length < 100) break;
  }
  console.log(`Fetched ${Object.keys(mediaMap).length} media items`);

  // Filter & sanitize
  let imported = 0;
  let skipped = 0;
  const existingSlugs = new Set<string>();

  // Clear existing news first
  await prisma.news.deleteMany();

  for (const post of allPosts) {
    const rawTitle = stripHtml(post.title?.rendered || '');
    const rawContent = post.content?.rendered || '';
    const rawExcerpt = stripHtml(post.excerpt?.rendered || '');

    // Skip spam
    if (isSpam(rawTitle) || isSpam(rawContent)) {
      skipped++;
      continue;
    }

    // Skip empty
    if (!rawTitle || rawTitle.length < 3) {
      skipped++;
      continue;
    }

    // Sanitize
    const title = rawTitle.substring(0, 200);
    const content = sanitizeHtml(rawContent);
    const excerpt = rawExcerpt.substring(0, 500) || null;
    const image = post.featured_media ? (mediaMap[post.featured_media] || null) : null;
    const date = new Date(post.date);

    // Generate unique slug
    let slug = safeSlug(rawTitle, post.id);
    // Transliterate Cyrillic for slug
    slug = transliterate(slug);
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${post.id}`;
    }
    existingSlugs.add(slug);

    try {
      await prisma.news.create({
        data: { title, slug, excerpt, content, image, published: true, date },
      });
      imported++;
    } catch (e: any) {
      console.error(`  Skip "${title.substring(0, 40)}": ${e.message?.substring(0, 80)}`);
      skipped++;
    }
  }

  console.log(`✅ News: ${imported} imported, ${skipped} skipped (spam/empty/duplicate)`);
}

async function importPages() {
  console.log('Fetching pages from WP...');
  const pages = await wpFetch('pages?per_page=50&_fields=id,title,content,slug');
  if (!Array.isArray(pages)) return;

  const validSlugs = ['about', 'different-info']; // about and anti-doping
  const slugMap: Record<string, string> = { 'about': 'about', 'different-info': 'anti-doping' };

  for (const page of pages) {
    const wpSlug = page.slug;
    const ourSlug = slugMap[wpSlug];
    if (!ourSlug) continue;

    const title = stripHtml(page.title?.rendered || '');
    const content = sanitizeHtml(page.content?.rendered || '');

    if (isSpam(title) || isSpam(content) || !content) continue;

    await prisma.page.upsert({
      where: { slug: ourSlug },
      update: { title, content },
      create: { slug: ourSlug, title, content },
    });
    console.log(`  Page "${ourSlug}" updated`);
  }
  console.log('✅ Pages imported');
}

function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
    'з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c',
    'ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  };
  return text.split('').map(c => map[c] || c).join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

async function main() {
  console.log('=== Importing from shooting.kg (with sanitization) ===\n');
  await importPosts();
  await importPages();
  console.log('\n=== Done ===');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
