import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const pagesRouter = Router();

pagesRouter.get('/slug/:slug', async (req: Request, res: Response) => {
  const page = await prisma.page.findUnique({ where: { slug: req.params.slug as string } });
  if (!page) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(page);
});

pagesRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const pages = await prisma.page.findMany({ orderBy: { title: 'asc' } });
  res.json(pages);
});

pagesRouter.get('/:id', async (req: Request, res: Response) => {
  const page = await prisma.page.findUnique({ where: { id: Number(req.params.id) } });
  if (!page) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(page);
});

pagesRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const page = await prisma.page.create({ data: sanitizeInput(req.body) });
    res.status(201).json(page);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

pagesRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const page = await prisma.page.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(page);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

pagesRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.page.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
