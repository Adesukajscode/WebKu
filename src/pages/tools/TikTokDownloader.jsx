import ToolLayout from "../../components/ToolLayout";
import { getToolBySlug } from "../../data/tools";

export default function TikTokDownloader() {
  const tool = getToolBySlug("tiktok");
  return <ToolLayout tool={tool} placeholder="https://tiktok.com/@user/video/..." />;
}
