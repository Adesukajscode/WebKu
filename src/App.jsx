import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ToolsPage from "./pages/ToolsPage";
import YouTubeDownloader from "./pages/tools/YouTubeDownloader";
import InstagramDownloader from "./pages/tools/InstagramDownloader";
import TikTokDownloader from "./pages/tools/TikTokDownloader";
import TwitterDownloader from "./pages/tools/TwitterDownloader";
import FacebookDownloader from "./pages/tools/FacebookDownloader";
import ImageConverter from "./pages/tools/ImageConverter";
import FileZip from "./pages/tools/FileZip";
import AudioConverter from "./pages/tools/AudioConverter";
import QRGenerator from "./pages/tools/QRGenerator";
import PasswordGenerator from "./pages/tools/PasswordGenerator";
import TextTools from "./pages/tools/TextTools";
import HandTracker from "./pages/tools/HandTracker";
import NightVision from "./pages/tools/NightVision";
import ContactCaller from "./pages/tools/ContactCaller";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tools" element={<ToolsPage />} />

          <Route path="tools/youtube" element={<YouTubeDownloader />} />
          <Route path="tools/instagram" element={<InstagramDownloader />} />
          <Route path="tools/tiktok" element={<TikTokDownloader />} />
          <Route path="tools/twitter" element={<TwitterDownloader />} />
          <Route path="tools/facebook" element={<FacebookDownloader />} />

          <Route path="tools/image-converter" element={<ImageConverter />} />
          <Route path="tools/file-zip" element={<FileZip />} />
          <Route path="tools/audio-converter" element={<AudioConverter />} />

          <Route path="tools/qr-generator" element={<QRGenerator />} />
          <Route path="tools/password-generator" element={<PasswordGenerator />} />
          <Route path="tools/text-tools" element={<TextTools />} />
          <Route path="tools/hand-tracker" element={<HandTracker />} />
          <Route path="tools/night-vision" element={<NightVision />} />
          <Route path="tools/contact-caller" element={<ContactCaller />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
