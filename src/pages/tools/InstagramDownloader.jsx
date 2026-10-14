import ToolLayout from "../../components/ToolLayout";
import { getToolBySlug } from "../../data/tools";

export default function InstagramDownloader() {
  const tool = getToolBySlug("instagram");
  return <ToolLayout tool={tool} placeholder="https://instagram.com/reel/..." />;
}
