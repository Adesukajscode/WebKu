import ToolLayout from "../../components/ToolLayout";
import { getToolBySlug } from "../../data/tools";

export default function TwitterDownloader() {
  const tool = getToolBySlug("twitter");
  return <ToolLayout tool={tool} placeholder="https://x.com/user/status/..." />;
}
