import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const IMG = '/uploads/scraped';

async function main() {
  await prisma.eventResult.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.album.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.event.deleteMany();
  await prisma.news.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.slider.deleteMany();
  await prisma.video.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.document.deleteMany();
  await prisma.page.deleteMany();
  await prisma.setting.deleteMany();

  // Admin
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@shooting.kg' },
    update: {},
    create: { email: 'admin@shooting.kg', password: hash, name: 'Администратор', role: 'admin' },
  });

  // Settings
  for (const s of [
    { key: 'site_name', value: 'Федерация стрелкового спорта КР' },
    { key: 'site_description', value: 'Shooting Sport Federation of Kyrgyz Republic' },
    { key: 'phone', value: '+996 999 919 919' },
    { key: 'email', value: 'info@shooting.kg' },
    { key: 'address', value: 'Чокана Валиханова 2/14, Бишкек' },
    { key: 'facebook', value: 'https://www.facebook.com/shootingkg' },
    { key: 'instagram', value: 'https://www.instagram.com/shooting_kg/' },
    { key: 'whatsapp', value: 'https://wa.me/996999919919' },
    { key: 'telegram', value: 'https://t.me/shootingkg' },
    { key: 'countdown_date', value: '2026-10-19T10:00:00.000Z' },
    { key: 'countdown_title', value: 'До соревнований' },
  ]) await prisma.setting.create({ data: s });

  // Sliders
  await prisma.slider.createMany({ data: [
    { title: 'Имандос Бектенов завоевал серебро на Кубке мира среди юниоров', subtitle: 'Федерация стрелкового спорта КР', image: `${IMG}/slider-1.jpg`, order: 1, link: '/news' },
    { title: 'Федерация стрелкового спорта', subtitle: 'Кыргызской Республики', image: `${IMG}/slider-2.jpg`, order: 2 },
    { title: 'Развитие стрелкового спорта', subtitle: 'Тренировки · Соревнования · Результаты', image: `${IMG}/slider-3.jpg`, order: 3 },
  ]});

  // Pages
  await prisma.page.create({ data: {
    slug: 'about', title: 'О нас',
    content: '<h2>О Федерации</h2><p>Стрелковый спорт входит в программу Олимпийских игр и включает в себя несколько разных дисциплин и упражнений.</p><p>Федерация стрелкового спорта Кыргызской Республики была основана в 1992 году, с целью развития и популяризации стрелкового спорта среди населения страны.</p><p>С момента основания Федерации среди спортсменов появились успешные участники Олимпийских игр, призеры Азиатских, Центрально-Азиатских игр и призеры других международных соревнований.</p><h3>Наши цели</h3><ul><li>Развитие пулевой и стендовой стрельбы в Кыргызской Республике</li><li>Подготовка спортсменов высокого класса для участия в Олимпийских играх и международных соревнованиях</li><li>Повышение квалификации тренерского и судейского состава</li><li>Популяризация стрелкового спорта среди молодежи</li></ul>',
  }});
  await prisma.page.create({ data: {
    slug: 'anti-doping', title: 'Антидопинг',
    content: '<h2>Антидопинговая политика</h2><p>Федерация стрелкового спорта КР строго придерживается антидопинговой политики в соответствии с требованиями ISSF, WADA и Национального антидопингового агентства.</p><h3>Основные принципы</h3><ul><li>Нулевая терпимость к применению допинга</li><li>Регулярное тестирование спортсменов</li><li>Обучение спортсменов и тренеров антидопинговым правилам</li><li>Сотрудничество с НАДО КР</li></ul>',
  }});

  // Staff — Leadership
  for (const s of [
    { name: 'Молдоева Жибек', position: 'Президент ФССКР', photo: `${IMG}/staff-moldoeva.png`, order: 1 },
    { name: 'Гутник Д.', position: 'Генеральный секретарь', photo: `${IMG}/staff-gutnik.jpg`, order: 2 },
    { name: 'Тарасов А.В.', position: 'Вице-президент по практической стрельбе', photo: `${IMG}/staff-tarasov.jpg`, order: 3 },
    { name: 'Абдыкаев З.Ж.', position: 'Вице-президент по высокоточной стрельбе', photo: `${IMG}/staff-abdykaev.jpeg`, order: 4 },
    { name: 'Каунаш Т.К.', position: 'Вице-президент по работе с правоохранительными органами', photo: `${IMG}/staff-kaunash.jpeg`, order: 5 },
  ]) await prisma.staff.create({ data: { ...s, category: 'leadership' } });

  // Staff — Administration
  await prisma.staff.create({ data: { name: 'Гутник Т.В', position: 'Администрация', photo: `${IMG}/staff-gutnik.jpg`, category: 'administration', order: 1 } });

  // Staff — Coaches
  for (const c of [
    { name: 'Исмаилова М.Ю.', position: 'Тренер', photo: `${IMG}/coach-ismailova.png`, order: 1 },
    { name: 'Суровцев В.В.', position: 'Тренер', photo: `${IMG}/coach-surovcev.png`, order: 2 },
    { name: 'Иминов Р.Т', position: 'Тренер', photo: `${IMG}/coach-iminov.png`, order: 3 },
    { name: 'Коргушев А.И', position: 'Тренер', photo: `${IMG}/coach-korgushev.png`, order: 4 },
    { name: 'Шайнусова К.Ф', position: 'Тренер', photo: `${IMG}/coach-shainusova.png`, order: 5 },
    { name: 'Исмаилов Т.Ш', position: 'Тренер', photo: null, order: 6 },
    { name: 'Исмаилов Р.Т', position: 'Тренер', photo: null, order: 7 },
    { name: 'Ырсалиева З.Д', position: 'Тренер', photo: null, order: 8 },
    { name: 'Шаимбетова Нагима', position: 'Тренер', photo: null, order: 9 },
  ]) await prisma.staff.create({ data: { ...c, category: 'coaches' } });

  // Staff — Judges
  for (const j of [
    { name: 'Гутник Т.В', position: 'Судья', photo: `${IMG}/staff-gutnik.jpg`, order: 1 },
    { name: 'Исмаилов Т.Ш', position: 'Судья', photo: `${IMG}/coach-iminov.png`, order: 2 },
    { name: 'Исмаилов Р.Т', position: 'Судья', photo: `${IMG}/coach-korgushev.png`, order: 3 },
    { name: 'Исмаилова М.Ю', position: 'Судья', photo: null, order: 4 },
    { name: 'Ырсалиева З.Д', position: 'Судья', photo: null, order: 5 },
  ]) await prisma.staff.create({ data: { ...j, category: 'judges' } });

  // ===== NEWS — 53 articles from shooting.kg =====
  const newsJson = JSON.parse(readFileSync(join(__dirname, 'seed-news.json'), 'utf-8'));
  for (const n of newsJson) {
    const contentHtml = n.content.split('\n\n').map((p: string) => `<p>${p}</p>`).join('');
    await prisma.news.create({ data: {
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt || null,
      content: contentHtml || null,
      date: new Date(n.date),
      image: n.image || null,
      gallery: n.gallery || [],
      published: true,
    }});
  }

  // Events
  for (const e of [
    { title: '1-ый этап Кубка Федерации', slug: 'i-etap-kubka-2024', description: 'Первый этап Кубка Федерации стрелкового спорта КР.', startDate: new Date('2024-02-03'), endDate: new Date('2024-02-04'), location: 'Бишкек, стрелковый комплекс 9х19', published: true, image: `${IMG}/section-events.jpg` },
    { title: 'Кубок мира ISSF — Гранада', slug: 'kubok-mira-granada', description: 'Кубок Мира ISSF по пулевой стрельбе в Гранаде, Испания.', startDate: new Date('2024-02-10'), endDate: new Date('2024-02-18'), location: 'Гранада, Испания', published: true, image: `${IMG}/slider-1.jpg` },
    { title: 'Чемпионат г. Бишкек', slug: 'chempionat-bishkek-2024', description: 'Чемпионат города Бишкек по пулевой стрельбе.', startDate: new Date('2024-03-09'), endDate: new Date('2024-03-11'), location: 'Бишкек', published: true, image: `${IMG}/gallery-15.jpg` },
    { title: 'Рио-де-Жанейро (Бразилия)', slug: 'rio-2024', description: 'Сборная КР на соревнованиях в Рио-де-Жанейро.', startDate: new Date('2024-04-10'), endDate: new Date('2024-04-18'), location: 'Рио-де-Жанейро, Бразилия', published: true },
    { title: 'Кубок Мира — Баку', slug: 'kubok-mira-baku', description: 'Кубок Мира ISSF в Баку, Азербайджан.', startDate: new Date('2024-05-01'), endDate: new Date('2024-05-12'), location: 'Баку, Азербайджан', published: true, image: `${IMG}/slider-2.jpg` },
    { title: 'Гран-При им.Абдыкеримова', slug: 'gran-pri-abdykerimova', description: 'Гран-При им.Абдыкеримова Ш.Ш.', startDate: new Date('2024-05-20'), endDate: new Date('2024-05-22'), location: 'Бишкек', published: true },
    { title: '2-ой этап Кубка Федерации', slug: 'ii-etap-kubka-2024', description: 'Второй этап Кубка Федерации.', startDate: new Date('2024-06-15'), endDate: new Date('2024-06-16'), location: 'Бишкек', published: true, image: `${IMG}/gallery-8.jpg` },
    { title: 'Кубок Азии — Алматы', slug: 'kubok-azii-2024', description: 'Кубок Азии по стендовой стрельбе в Алматы.', startDate: new Date('2024-09-20'), endDate: new Date('2024-09-30'), location: 'Алматы, Казахстан', published: true },
    { title: '3-ий этап Кубка Федерации', slug: 'iii-etap-kubka-2024', description: 'Третий этап Кубка Федерации.', startDate: new Date('2024-09-28'), endDate: new Date('2024-09-29'), location: 'Бишкек', published: true, image: `${IMG}/gallery-9.jpg` },
    { title: 'Соревнования им.Почивалова — Шымкент', slug: 'pochivalov-2024', description: 'Международные соревнования им.Почивалова.', startDate: new Date('2024-10-23'), endDate: new Date('2024-10-27'), location: 'Шымкент, Казахстан', published: true, image: `${IMG}/section-news.jpg` },
    { title: '4-ый этап Кубка Федерации', slug: 'iv-etap-kubka-2024', description: 'Четвертый этап Кубка Федерации.', startDate: new Date('2024-11-23'), endDate: new Date('2024-11-24'), location: 'Бишкек', published: true, image: `${IMG}/news-cup4.jpg` },
    { title: 'Чемпионат КР 2024', slug: 'chempionat-kr-2024', description: 'Чемпионат Кыргызской Республики по пулевой стрельбе.', startDate: new Date('2024-12-20'), endDate: new Date('2024-12-22'), location: 'Бишкек, стрелковый комплекс 9х19', published: true, image: `${IMG}/news-championship.jpg` },
    { title: 'Алтын Мерген 2025 — Шымкент', slug: 'altyn-mergen-2025', description: 'Соревнования Алтын Мерген.', startDate: new Date('2025-03-02'), endDate: new Date('2025-03-09'), location: 'Шымкент, Казахстан', published: true },
  ]) await prisma.event.create({ data: e });

  // Event Results
  const evChamp = await prisma.event.findFirst({ where: { slug: 'chempionat-bishkek-2024' } });
  if (evChamp) {
    await prisma.eventResult.createMany({ data: [
      { eventId: evChamp.id, athlete: 'Токмоков Аскат', category: 'ПП-60 Мужчины', score: '573', rank: 1, medal: 'gold' },
      { eventId: evChamp.id, athlete: 'Бектенов Имандос', category: 'ПП-60 Мужчины', score: '577', rank: 2, medal: 'silver' },
      { eventId: evChamp.id, athlete: 'Родионов Руслан', category: 'ПП-60 Мужчины', score: '568', rank: 3, medal: 'bronze' },
      { eventId: evChamp.id, athlete: 'Шапиро Назар', category: 'ВП-60 Мужчины', score: '586.6', rank: 1, medal: 'gold' },
      { eventId: evChamp.id, athlete: 'Талантбекова Арууке', category: 'ВП-60 Женщины', score: '627.7', rank: 1, medal: 'gold' },
      { eventId: evChamp.id, athlete: 'Щуковская Анастасия', category: 'ВП-60 Женщины', score: '623.1', rank: 2, medal: 'silver' },
    ]});
  }

  // Photos & Albums
  const album1 = await prisma.album.create({ data: { title: 'Чемпионат КР 2024', cover: `${IMG}/news-championship.jpg` } });
  const album2 = await prisma.album.create({ data: { title: 'Кубок Федерации', cover: `${IMG}/news-cup-results.jpg` } });
  const album3 = await prisma.album.create({ data: { title: 'Тренировки', cover: `${IMG}/gallery-1.jpg` } });
  const photos = [
    { image: `${IMG}/gallery-1.jpg`, albumId: album3.id },
    { image: `${IMG}/gallery-2.jpg`, albumId: album1.id },
    { image: `${IMG}/gallery-3.jpg`, albumId: album1.id },
    { image: `${IMG}/gallery-4.jpeg`, albumId: album1.id },
    { image: `${IMG}/gallery-5.jpeg`, albumId: album1.id },
    { image: `${IMG}/gallery-6.jpg`, albumId: album2.id },
    { image: `${IMG}/gallery-7.jpg`, albumId: album2.id },
    { image: `${IMG}/gallery-8.jpg`, albumId: album2.id },
    { image: `${IMG}/gallery-9.jpg`, albumId: album2.id },
    { image: `${IMG}/gallery-10.jpg`, albumId: album2.id },
    { image: `${IMG}/gallery-11.jpg`, albumId: album3.id },
    { image: `${IMG}/gallery-12.jpg`, albumId: album3.id },
    { image: `${IMG}/gallery-13.jpg`, albumId: album3.id },
    { image: `${IMG}/gallery-14.jpg`, albumId: album3.id },
    { image: `${IMG}/gallery-15.jpg`, albumId: album3.id },
  ];
  for (let i = 0; i < photos.length; i++) await prisma.photo.create({ data: { ...photos[i], order: i + 1 } });

  // Videos
  await prisma.video.createMany({ data: [
    { title: 'ISSF World Cup 2024 Highlights', youtubeUrl: 'https://www.youtube.com/watch?v=88wPTydDtYU', order: 1 },
    { title: 'Training Session — National Team', youtubeUrl: 'https://www.youtube.com/watch?v=mlUvGEuw2OM', order: 2 },
    { title: 'ISSF Rifle & Pistol Finals', youtubeUrl: 'https://www.youtube.com/watch?v=oAiiUde5n10', order: 3 },
    { title: 'Asian Shooting Championship', youtubeUrl: 'https://www.youtube.com/watch?v=xO1LXhI_SaA', order: 4 },
  ]});

  // Partners
  await prisma.partner.createMany({ data: [
    { name: 'ISSF', logo: `${IMG}/partner-issf.jpg`, url: 'https://www.issf-sports.org/', order: 1 },
    { name: 'ASC', logo: `${IMG}/partner-asc.jpg`, url: 'https://www.asia-shooting.org/', order: 2 },
    { name: 'НОК Кыргызстана', logo: `${IMG}/partner-noc.jpg`, url: 'https://olympic.kg/', order: 3 },
    { name: 'ЛГ', logo: `${IMG}/partner-lg.jpg`, url: '#', order: 4 },
  ]});

  // Documents
  await prisma.document.createMany({ data: [
    { title: 'Устав Федерации стрелкового спорта КР', category: 'official', file: '#', order: 1 },
    { title: 'Положение о членстве в ФССКР', category: 'official', file: '#', order: 2 },
    { title: 'Календарный план ФССКР 2025 года', category: 'official', file: '#', order: 3 },
    { title: 'Календарный план ФССКР 2024 года', category: 'official', file: '#', order: 4 },
    { title: 'Правила соревнований ISSF', category: 'regulations', file: '#', order: 5 },
    { title: 'Антидопинговые правила ISSF', category: 'regulations', file: '#', order: 6 },
    { title: 'Положение о рейтинговой системе', category: 'regulations', file: '#', order: 7 },
  ]});

  // Ratings
  const ratingsData = [
    { discipline: 'vp_women', athletes: [
      { name: 'Талантбекова Арууке', score: 627.7 }, { name: 'Щуковская Анастасия', score: 623.1 },
      { name: 'Кубанычбекова Каныкей', score: 622.8 }, { name: 'Бекташева Жибек', score: 621.2 },
      { name: 'Эргешова Айжан', score: 616.3 },
    ]},
    { discipline: 'vp_men', athletes: [
      { name: 'Шапиро Назар', score: 591.8 }, { name: 'Ким Александр', score: 586.7 },
      { name: 'Агулов Владимир', score: 605.2 }, { name: 'Цой Никита', score: 566.9 },
      { name: 'Джумагулов Тимур', score: 566.4 },
    ]},
    { discipline: 'pp_men', athletes: [
      { name: 'Бектенов Имандос', score: 581 }, { name: 'Токмоков Аскат', score: 577 },
      { name: 'Родионов Руслан', score: 571 }, { name: 'Жакыпов Нуршат', score: 568 },
      { name: 'Кошелев Александр', score: 564 },
    ]},
    { discipline: 'pp_women', athletes: [
      { name: 'Махмадова Бахтигуль', score: 559 }, { name: 'Кубанычбекова Каныкей', score: 545 },
      { name: 'Кочкорова Аниса', score: 538 },
    ]},
  ];
  for (const rd of ratingsData) {
    for (let i = 0; i < rd.athletes.length; i++) {
      await prisma.rating.create({ data: { athlete: rd.athletes[i].name, discipline: rd.discipline, score: rd.athletes[i].score, rank: i + 1, year: 2024 } });
    }
  }

  console.log('✅ Seed completed — 53 news articles + all data from shooting.kg!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
