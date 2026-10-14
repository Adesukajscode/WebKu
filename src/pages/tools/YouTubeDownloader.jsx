import ToolLayout from "../../components/ToolLayout";
import { getToolBySlug } from "../../data/tools";

export default function YouTubeDownloader() {
  const tool = getToolBySlug("youtube");
  return <ToolLayout tool={tool} placeholder="https://youtube.com/watch?v=..." />;
}
