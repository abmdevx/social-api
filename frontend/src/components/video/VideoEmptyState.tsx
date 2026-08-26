import { Film } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function VideoEmptyState({ searching }: { searching: boolean }) {
  return <EmptyState icon={<Film size={30} />} title={searching ? "No videos matched" : "No published videos yet"} description={searching ? "Try a different title or description." : "Uploads appear here after they are published from Studio."} />;
}
