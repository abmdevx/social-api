import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";
import WatchPage from "../pages/WatchPage";
import ChannelPage from "../pages/ChannelPage";
import StudioDashboardPage from "../pages/StudioDashboardPage";
import StudioUploadPage from "../pages/StudioUploadPage";
import StudioVideosPage from "../pages/StudioVideosPage";
import PlaylistsPage from "../pages/PlaylistsPage";
import PlaylistDetailPage from "../pages/PlaylistDetailPage";
import TweetsPage from "../pages/TweetsPage";
import HistoryPage from "../pages/HistoryPage";
import LikedVideosPage from "../pages/LikedVideosPage";
import SubscriptionsPage from "../pages/SubscriptionsPage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<HomePage />} />
      <Route path="/watch/:videoId" element={<WatchPage />} />
      <Route path="/channel/:username" element={<ChannelPage />} />
      <Route path="/channel/:username/tweets" element={<ChannelPage />} />
      <Route path="/channel/:username/playlists" element={<ChannelPage />} />
      <Route path="/studio" element={<StudioDashboardPage />} />
      <Route path="/studio/upload" element={<StudioUploadPage />} />
      <Route path="/studio/videos" element={<StudioVideosPage />} />
      <Route path="/playlists" element={<PlaylistsPage />} />
      <Route path="/playlists/:playlistId" element={<PlaylistDetailPage />} />
      <Route path="/tweets" element={<TweetsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/liked" element={<LikedVideosPage />} />
      <Route path="/subscriptions" element={<SubscriptionsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/setup" element={<HomePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
