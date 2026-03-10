import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { sanitizeInput } from '../lib/sanitize';
import { handlePrismaError } from '../lib/errors';

export const photosRouter = Router();

photosRouter.get('/albums', async (_req: Request, res: Response) => {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { photos: true } } },
  });
  res.json(albums);
});

photosRouter.get('/', async (req: Request, res: Response) => {
  const albumId = req.query.albumId ? Number(req.query.albumId) : undefined;
  const where = albumId ? { albumId } : {};
  const photos = await prisma.photo.findMany({ where, orderBy: { order: 'asc' } });
  res.json(photos);
});

photosRouter.get('/albums/admin', authMiddleware, async (_req: Request, res: Response) => {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { photos: true } } },
  });
  res.json(albums);
});

photosRouter.post('/albums', authMiddleware, async (req: Request, res: Response) => {
  try {
    const album = await prisma.album.create({ data: sanitizeInput(req.body) });
    res.status(201).json(album);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

photosRouter.put('/albums/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const album = await prisma.album.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(album);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

photosRouter.delete('/albums/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.album.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

photosRouter.get('/admin/all', authMiddleware, async (_req: Request, res: Response) => {
  const photos = await prisma.photo.findMany({
    orderBy: { order: 'asc' },
    include: { album: { select: { title: true } } },
  });
  res.json(photos);
});

photosRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const photo = await prisma.photo.create({ data: sanitizeInput(req.body) });
    res.status(201).json(photo);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

photosRouter.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const photo = await prisma.photo.update({ where: { id: Number(req.params.id) }, data: sanitizeInput(req.body) });
    res.json(photo);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

photosRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await prisma.photo.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});
