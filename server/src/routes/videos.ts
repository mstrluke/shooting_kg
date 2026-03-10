import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const videosRouter = Router();

videosRouter.get('/', async (_req: Request, res: Response) => {
  const items = await prisma.video.findMany({ orderBy: { order: 'asc' } });
  res.json(items);
});

videosRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const items = await prisma.video.findMany({ orderBy: { order: 'asc' } });
  res.json(items);
});

videosRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.video.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

videosRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.video.create({ data: sanitizeInput(req.body) });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

videosRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.video.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

videosRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.video.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
