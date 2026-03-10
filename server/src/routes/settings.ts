import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const settingsRouter = Router();

// Allowed setting keys (whitelist)
const HERO_PAGES = ['news', 'events', 'staff', 'media', 'video', 'documents', 'ratings', 'results', 'about', 'antidoping'];
const HERO_KEYS = HERO_PAGES.flatMap(p => [`hero_${p}`, `hero_${p}_title`, `hero_${p}_subtitle`]);

const ALLOWED_KEYS = [
  'site_name', 'site_description', 'phone', 'email', 'address',
  'facebook', 'instagram', 'whatsapp', 'telegram',
  'countdown_date', 'countdown_title',
  ...HERO_KEYS,
];

// Public - all settings as key-value map
settingsRouter.get('/', async (_req: Request, res: Response) => {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });
  res.json(map);
});

// Admin - update settings (batch)
settingsRouter.put('/', authMiddleware, async (req: Request, res: Response) => {
  const data = req.body as Record<string, string>;

  for (const [key, value] of Object.entries(data)) {
    // Only allow whitelisted keys
    if (!ALLOWED_KEYS.includes(key)) continue;

    // Sanitize value — strip HTML/scripts (but keep URLs intact for hero_ keys)
    const cleanValue = typeof value === 'string'
      ? key.startsWith('hero_') ? value.trim() : value.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, '').trim()
      : '';

    await prisma.setting.upsert({
      where: { key },
      update: { value: cleanValue },
      create: { key, value: cleanValue },
    });
  }
  res.json({ success: true });
});
