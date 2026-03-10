import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";

// Layout
import Layout from "./components/layout/Layout";

// Public pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import StaffPage from "./pages/StaffPage";
import MediaPage from "./pages/MediaPage";
import VideoPage from "./pages/VideoPage";
import DocumentsPage from "./pages/DocumentsPage";
import RatingsPage from "./pages/RatingsPage";
import ResultsPage from "./pages/ResultsPage";
import AntiDopingPage from "./pages/AntiDopingPage";

// Admin
import LoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminSlidersPage from "./pages/admin/AdminSlidersPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminStaffPage from "./pages/admin/AdminStaffPage";
import AdminPhotosPage from "./pages/admin/AdminPhotosPage";
import AdminVideosPage from "./pages/admin/AdminVideosPage";
import AdminPartnersPage from "./pages/admin/AdminPartnersPage";
import AdminDocumentsPage from "./pages/admin/AdminDocumentsPage";
import AdminRatingsPage from "./pages/admin/AdminRatingsPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => !!s.token);
  if (!isAuth) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/staff/:category" element={<StaffPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/ratings/:discipline" element={<RatingsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/anti-doping" element={<AntiDopingPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="sliders" element={<AdminSlidersPage />} />
        <Route path="news" element={<AdminNewsPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="photos" element={<AdminPhotosPage />} />
        <Route path="videos" element={<AdminVideosPage />} />
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
        <Route path="ratings" element={<AdminRatingsPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}
