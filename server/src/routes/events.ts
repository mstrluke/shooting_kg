import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const eventsRouter = Router();

eventsRouter.get('/', async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.event.findMany({ where: { published: true }, orderBy: { startDate: 'desc' }, skip, take: limit }),
    prisma.event.count({ where: { published: true } }),
  ]);
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

eventsRouter.get('/slug/:slug', async (req: Request, res: Response) => {
  const item = await prisma.event.findUnique({
    where: { slug: req.params.slug as string },
    include: { results: { orderBy: { rank: 'asc' } } },
  });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

eventsRouter.get('/admin/all', authMiddleware, async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.event.findMany({ orderBy: { startDate: 'desc' }, skip, take: limit, include: { _count: { select: { results: true } } } }),
    prisma.event.count(),
  ]);
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

eventsRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.event.findUnique({
    where: { id: Number(req.params.id) },
    include: { results: { orderBy: { rank: 'asc' } } },
  });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

eventsRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { results, ...rawData } = req.body;
    const data = sanitizeInput(rawData);
    const item = await prisma.event.create({
      data: {
        ...data,
        results: results ? { createMany: { data: results } } : undefined,
      },
      include: { results: true },
    });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

eventsRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { results, ...rawData } = req.body;
    const data = sanitizeInput(rawData);
    if (results) {
      await prisma.eventResult.deleteMany({ where: { eventId: Number(req.params.id) } });
    }
    const item = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: {
        ...data,
        results: results ? { createMany: { data: results } } : undefined,
      },
      include: { results: true },
    });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

eventsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.event.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
