import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

export default api;

// --- API functions ---

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);

// Settings
export const getSettings = () => api.get('/settings').then((r) => r.data);
export const updateSettings = (data: Record<string, string>) =>
  api.put('/settings', data).then((r) => r.data);

// Sliders
export const getSliders = () => api.get('/sliders').then((r) => r.data);
export const getSlidersAdmin = () => api.get('/sliders/admin').then((r) => r.data);
export const getSlider = (id: number) => api.get(`/sliders/${id}`).then((r) => r.data);
export const createSlider = (data: any) => api.post('/sliders', data).then((r) => r.data);
export const updateSlider = (id: number, data: any) => api.put(`/sliders/${id}`, data).then((r) => r.data);
export const deleteSlider = (id: number) => api.delete(`/sliders/${id}`).then((r) => r.data);

// News
export const getNews = (page = 1, limit = 10) =>
  api.get('/news', { params: { page, limit } }).then((r) => r.data);
export const getNewsBySlug = (slug: string) => api.get(`/news/slug/${slug}`).then((r) => r.data);
export const getNewsAdmin = (page = 1, limit = 40) =>
  api.get('/news/admin/all', { params: { page, limit } }).then((r) => r.data);
export const getNewsItem = (id: number) => api.get(`/news/${id}`).then((r) => r.data);
export const createNews = (data: any) => api.post('/news', data).then((r) => r.data);
export const updateNews = (id: number, data: any) => api.put(`/news/${id}`, data).then((r) => r.data);
export const deleteNews = (id: number) => api.delete(`/news/${id}`).then((r) => r.data);

// Events
export const getEvents = (page = 1, limit = 10) =>
  api.get('/events', { params: { page, limit } }).then((r) => r.data);
export const getEventBySlug = (slug: string) => api.get(`/events/slug/${slug}`).then((r) => r.data);
export const getEventsAdmin = (page = 1, limit = 40) =>
  api.get('/events/admin/all', { params: { page, limit } }).then((r) => r.data);
export const getEvent = (id: number) => api.get(`/events/${id}`).then((r) => r.data);
export const createEvent = (data: any) => api.post('/events', data).then((r) => r.data);
export const updateEvent = (id: number, data: any) => api.put(`/events/${id}`, data).then((r) => r.data);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`).then((r) => r.data);

// Staff
export const getStaff = (category?: string) =>
  api.get('/staff', { params: { category } }).then((r) => r.data);
export const getStaffAdmin = () => api.get('/staff/admin/all').then((r) => r.data);
export const getStaffItem = (id: number) => api.get(`/staff/${id}`).then((r) => r.data);
export const createStaff = (data: any) => api.post('/staff', data).then((r) => r.data);
export const updateStaff = (id: number, data: any) => api.put(`/staff/${id}`, data).then((r) => r.data);
export const deleteStaff = (id: number) => api.delete(`/staff/${id}`).then((r) => r.data);

// Photos & Albums
export const getAlbums = () => api.get('/photos/albums').then((r) => r.data);
export const getPhotos = (albumId?: number) =>
  api.get('/photos', { params: { albumId } }).then((r) => r.data);
export const getPhotosAdmin = () => api.get('/photos/admin/all').then((r) => r.data);
export const createAlbum = (data: any) => api.post('/photos/albums', data).then((r) => r.data);
export const updateAlbum = (id: number, data: any) => api.put(`/photos/albums/${id}`, data).then((r) => r.data);
export const deleteAlbum = (id: number) => api.delete(`/photos/albums/${id}`).then((r) => r.data);
export const createPhoto = (data: any) => api.post('/photos', data).then((r) => r.data);
export const updatePhoto = (id: number, data: any) => api.put(`/photos/${id}`, data).then((r) => r.data);
export const deletePhoto = (id: number) => api.delete(`/photos/${id}`).then((r) => r.data);

// Videos
export const getVideos = () => api.get('/videos').then((r) => r.data);
export const getVideosAdmin = () => api.get('/videos/admin/all').then((r) => r.data);
export const getVideo = (id: number) => api.get(`/videos/${id}`).then((r) => r.data);
export const createVideo = (data: any) => api.post('/videos', data).then((r) => r.data);
export const updateVideo = (id: number, data: any) => api.put(`/videos/${id}`, data).then((r) => r.data);
export const deleteVideo = (id: number) => api.delete(`/videos/${id}`).then((r) => r.data);

// Partners
export const getPartners = () => api.get('/partners').then((r) => r.data);
export const getPartnersAdmin = () => api.get('/partners/admin/all').then((r) => r.data);
export const getPartner = (id: number) => api.get(`/partners/${id}`).then((r) => r.data);
export const createPartner = (data: any) => api.post('/partners', data).then((r) => r.data);
export const updatePartner = (id: number, data: any) => api.put(`/partners/${id}`, data).then((r) => r.data);
export const deletePartner = (id: number) => api.delete(`/partners/${id}`).then((r) => r.data);

// Documents
export const getDocuments = (category?: string) =>
  api.get('/documents', { params: { category } }).then((r) => r.data);
export const getDocumentsAdmin = () => api.get('/documents/admin/all').then((r) => r.data);
export const getDocument = (id: number) => api.get(`/documents/${id}`).then((r) => r.data);
export const createDocument = (data: any) => api.post('/documents', data).then((r) => r.data);
export const updateDocument = (id: number, data: any) => api.put(`/documents/${id}`, data).then((r) => r.data);
export const deleteDocument = (id: number) => api.delete(`/documents/${id}`).then((r) => r.data);

// Ratings
export const getRatings = (discipline: string, year?: number) =>
  api.get('/ratings', { params: { discipline, year } }).then((r) => r.data);
export const getRatingsAdmin = () => api.get('/ratings/admin/all').then((r) => r.data);
export const getRating = (id: number) => api.get(`/ratings/${id}`).then((r) => r.data);
export const createRating = (data: any) => api.post('/ratings', data).then((r) => r.data);
export const updateRating = (id: number, data: any) => api.put(`/ratings/${id}`, data).then((r) => r.data);
export const deleteRating = (id: number) => api.delete(`/ratings/${id}`).then((r) => r.data);

// Pages
export const getPageBySlug = (slug: string) => api.get(`/pages/slug/${slug}`).then((r) => r.data);
export const getPagesAdmin = () => api.get('/pages/admin/all').then((r) => r.data);
export const getPage = (id: number) => api.get(`/pages/${id}`).then((r) => r.data);
export const createPage = (data: any) => api.post('/pages', data).then((r) => r.data);
export const updatePage = (id: number, data: any) => api.put(`/pages/${id}`, data).then((r) => r.data);
export const deletePage = (id: number) => api.delete(`/pages/${id}`).then((r) => r.data);

// Upload
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
