/**
 * Clean up fake seed data and normalize all records.
 * - Remove documents with fake file URLs (#)
 * - Remove partners without logos
 * - Fix slider images (download real ones)
 * - Add real photo gallery from WP media
 * - Clean up news without enough content
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== CLEANUP & NORMALIZE ===\n');

  // 1. Delete fake documents (file = '#')
  const fakeDocs = await prisma.document.deleteMany({ where: { file: '#' } });
  console.log(`Documents: deleted ${fakeDocs.count} fake (file='#')`);

  // 2. Fix partners — remove ones without logos
  const noLogos = await prisma.partner.deleteMany({ where: { logo: '' } });
  console.log(`Partners: deleted ${noLogos.count} without logos`);

  // 3. Update sliders with local images from our wp-images
  // Use real shooting sport images we already downloaded
  const sliders = await prisma.slider.findMany();
  const sliderImages = [
    '/uploads/wp-images/2025-03-whatsapp-image-2025-03-13-at-13.10.10.jpeg',
    '/uploads/wp-images/2024-12-1-1-scaled.jpg',
    '/uploads/wp-images/2024-09-opa15695-1-scaled.jpg',
  ];
  for (let i = 0; i < sliders.length && i < sliderImages.length; i++) {
    await prisma.slider.update({
      where: { id: sliders[i].id },
      data: { image: sliderImages[i] },
    });
  }
  console.log(`Sliders: updated ${Math.min(sliders.length, sliderImages.length)} with local images`);

  // 4. Populate photo gallery from downloaded wp-images
  // Pick the best photos (large, non-thumbnail)
  const fs = await import('fs');
  const path = await import('path');
  const imgDir = path.join(__dirname, '..', 'uploads', 'wp-images');
  const allFiles = fs.readdirSync(imgDir)
    .filter((f: string) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .filter((f: string) => !/-150x150|-300x300/.test(f))  // Skip tiny thumbnails
    .filter((f: string) => {
      const stat = fs.statSync(path.join(imgDir, f));
      return stat.size > 50000; // Only files > 50KB (real photos)
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, 24); // Pick 24 good photos

  // Delete old photos and create new ones
  await prisma.photo.deleteMany();
  let photoCount = 0;
  for (const file of allFiles) {
    await prisma.photo.create({
      data: {
        title: file.replace(/^\d{4}-\d{2}-/, '').replace(/[-_]/g, ' ').replace(/\.\w+$/, '').trim() || 'Фото',
        image: `/uploads/wp-images/${file}`,
        order: photoCount,
      },
    });
    photoCount++;
  }
  console.log(`Photos: created ${photoCount} from downloaded images`);

  // 5. Clean news — remove articles with no content at all
  const emptyNews = await prisma.news.deleteMany({
    where: { title: '' },
  });
  console.log(`News: deleted ${emptyNews.count} empty articles`);

  // 6. Normalize news — ensure all have excerpts
  const newsNoExcerpt = await prisma.news.findMany({
    where: { excerpt: { equals: null } },
    select: { id: true, content: true },
  });
  for (const n of newsNoExcerpt) {
    if (n.content) {
      // Extract first ~200 chars of text from content
      const text = n.content
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200);
      if (text.length > 10) {
        await prisma.news.update({
          where: { id: n.id },
          data: { excerpt: text + (text.length >= 200 ? '...' : '') },
        });
      }
    }
  }
  console.log(`News: generated excerpts for ${newsNoExcerpt.length} articles`);

  // 7. Add real documents we downloaded
  const realDocs = [
    { title: 'Протокол ЧКР 2022 — ПП3 мужчины', file: '/uploads/documents/protokol-chkr-2022-pp-3m.docx', category: 'official', order: 1 },
    { title: 'Протокол ЧКР 2022 — ПП3 женщины', file: '/uploads/documents/protokol-chkr-2022-pp-3zh.docx', category: 'official', order: 2 },
    { title: 'Протокол ЧКР 2022 — ВП6 мужчины', file: '/uploads/documents/protokol-chkr-2022-vp-6m.docx', category: 'official', order: 3 },
    { title: 'Протокол ЧКР 2022 — ВП6 женщины', file: '/uploads/documents/protokol-chkr-2022-vp-6zh-1.docx', category: 'official', order: 4 },
  ];
  for (const d of realDocs) {
    const exists = await prisma.document.findFirst({ where: { file: d.file } });
    if (!exists) {
      await prisma.document.create({ data: d });
    }
  }
  console.log(`Documents: ensured ${realDocs.length} real documents exist`);

  // Final counts
  const counts = {
    news: await prisma.news.count(),
    events: await prisma.event.count(),
    staff: await prisma.staff.count(),
    photos: await prisma.photo.count(),
    videos: await prisma.video.count(),
    documents: await prisma.document.count(),
    partners: await prisma.partner.count(),
    ratings: await prisma.rating.count(),
    sliders: await prisma.slider.count(),
  };
  console.log('\n=== FINAL COUNTS ===');
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
