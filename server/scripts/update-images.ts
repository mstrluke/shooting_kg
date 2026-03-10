/**
 * Update all news articles to use locally downloaded images
 * instead of remote shooting.kg URLs.
 * Also re-import posts with inline images properly mapped.
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Load URL map
const urlMap: Record<string, string> = JSON.parse(
  fs.readFileSync('/tmp/shooting_url_map.json', 'utf-8')
);

// Load full post data
const { posts, media_map: mediaMap } = JSON.parse(
  fs.readFileSync('/tmp/shooting_full_data.json', 'utf-8')
);

function replaceImageUrls(html: string): string {
  if (!html) return html;
  let result = html;
  // Replace all shooting.kg image URLs with local ones
  for (const [remote, local] of Object.entries(urlMap)) {
    result = result.replaceAll(remote, local);
  }
  // Also handle URL-encoded versions
  for (const [remote, local] of Object.entries(urlMap)) {
    const encoded = remote.replace(/[\u2014]/g, c => encodeURIComponent(c));
    if (encoded !== remote) {
      result = result.replaceAll(encoded, local);
    }
  }
  return result;
}

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

/** Sanitize HTML — keep safe tags, strip XSS */
function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
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
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s+on\w+\s*=\s*\S+/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')
    .replace(/<[^>]*(?:eval|alert|confirm|prompt|document\.|window\.)\([^>]*>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isSpam(text: string): boolean {
  const spamPatterns = [
    /[\u0590-\u05FF]{3,}/,
    /casino|gambling|escort|porn|sex|viagra|cialis/i,
    /паркан|інтер'єр|бетонн/i,
    /онлайн.?казино|ставк/i,
  ];
  return spamPatterns.some(p => p.test(text));
}

function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
    'з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c',
    'ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  };
  return text.toLowerCase().split('').map(c => map[c] || c).join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

async function main() {
  console.log(`URL map: ${Object.keys(urlMap).length} entries`);
  console.log(`Posts: ${posts.length}`);
  
  // Delete existing news and re-import with images
  await prisma.news.deleteMany();
  console.log('Cleared existing news');
  
  const existingSlugs = new Set<string>();
  let imported = 0;
  let skipped = 0;
  
  for (const post of posts) {
    const rawTitle = stripHtml(post.title?.rendered || '');
    const rawContent = post.content?.rendered || '';
    const rawExcerpt = stripHtml(post.excerpt?.rendered || '');
    
    if (isSpam(rawTitle) || isSpam(rawContent) || !rawTitle || rawTitle.length < 3) {
      skipped++;
      continue;
    }
    
    const title = rawTitle.substring(0, 200);
    
    // Sanitize then replace image URLs
    let content = sanitizeHtml(rawContent);
    content = replaceImageUrls(content);
    
    const excerpt = rawExcerpt.substring(0, 500) || null;
    
    // Featured image
    let image: string | null = null;
    const fmId = post.featured_media;
    if (fmId && mediaMap[String(fmId)]) {
      const remoteUrl = mediaMap[String(fmId)];
      image = urlMap[remoteUrl] || remoteUrl;
    }
    
    const date = new Date(post.date);
    
    let slug = transliterate(rawTitle).substring(0, 60);
    if (!slug) slug = `post-${post.id}`;
    if (existingSlugs.has(slug)) slug = `${slug}-${post.id}`;
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
  
  console.log(`\n✅ News: ${imported} imported, ${skipped} skipped`);
  
  // Count how many have local images
  const withImage = await prisma.news.count({ where: { image: { startsWith: '/uploads' } } });
  const withRemoteImage = await prisma.news.count({ where: { image: { startsWith: 'http' } } });
  const noImage = await prisma.news.count({ where: { OR: [{ image: null }, { image: '' }] } });
  console.log(`  Local images: ${withImage}`);
  console.log(`  Remote images: ${withRemoteImage}`);
  console.log(`  No image: ${noImage}`);
  
  // Check inline images in content
  const allNews = await prisma.news.findMany({ select: { content: true } });
  let localInline = 0, remoteInline = 0;
  for (const n of allNews) {
    const locals = (n.content?.match(/\/uploads\/wp-images\//g) || []).length;
    const remotes = (n.content?.match(/shooting\.kg\/wp-content/g) || []).length;
    localInline += locals;
    remoteInline += remotes;
  }
  console.log(`  Inline images (local): ${localInline}`);
  console.log(`  Inline images (still remote): ${remoteInline}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
