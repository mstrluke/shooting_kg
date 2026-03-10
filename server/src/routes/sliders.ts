import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const slidersRouter = Router();

slidersRouter.get('/', async (_req: Request, res: Response) => {
  const sliders = await prisma.slider.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
  res.json(sliders);
});

slidersRouter.get('/admin', authMiddleware, async (_req: Request, res: Response) => {
  const sliders = await prisma.slider.findMany({ orderBy: { order: 'asc' } });
  res.json(sliders);
});

slidersRouter.get('/:id', async (req: Request, res: Response) => {
  const slider = await prisma.slider.findUnique({ where: { id: Number(req.params.id) } });
  if (!slider) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(slider);
});

slidersRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const slider = await prisma.slider.create({ data: sanitizeInput(req.body) });
    res.status(201).json(slider);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

slidersRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const slider = await prisma.slider.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(slider);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

slidersRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.slider.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
