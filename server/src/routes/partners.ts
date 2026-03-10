import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const partnersRouter = Router();

partnersRouter.get('/', async (_req: Request, res: Response) => {
  const items = await prisma.partner.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  res.json(items);
});

partnersRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const items = await prisma.partner.findMany({ orderBy: { order: 'asc' } });
  res.json(items);
});

partnersRouter.get('/:id', async (req: Request, res: Response) => {
  const item = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

partnersRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.partner.create({ data: sanitizeInput(req.body) });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

partnersRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const item = await prisma.partner.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

partnersRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.partner.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
