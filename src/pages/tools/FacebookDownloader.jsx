import ToolLayout from "../../components/ToolLayout";
import { getToolBySlug } from "../../data/tools";

export default function FacebookDownloader() {
  const tool = getToolBySlug("facebook");
  return <ToolLayout tool={tool} placeholder="https://facebook.com/watch?v=..." />;
}
