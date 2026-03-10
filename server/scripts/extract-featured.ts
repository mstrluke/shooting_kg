/**
 * Extract first image from news content and set it as the featured image.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.news.findMany({ select: { id: true, content: true, image: true } });
  let updated = 0;
  
  for (const item of news) {
    if (item.image) continue; // Already has featured image
    
    // Find first img src in content
    const match = item.content?.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) {
      const imgUrl = match[1];
      await prisma.news.update({ where: { id: item.id }, data: { image: imgUrl } });
      updated++;
    }
  }
  
  const withImage = await prisma.news.count({ where: { image: { not: null } } });
  const noImage = await prisma.news.count({ where: { OR: [{ image: null }, { image: '' }] } });
  console.log(`✅ Set featured image for ${updated} news articles`);
  console.log(`   With image: ${withImage}, Without: ${noImage}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
