import { ArrowLeft, ListVideo, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Playlist } from "../../types/playlist";
import { Button } from "../ui/Button";

export function PlaylistHeader({ playlist, onEdit, onDelete }: { playlist: Playlist; onEdit: () => void; onDelete: () => void }) {
  return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><Link to="/playlists" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200"><ArrowLeft size={16} />All playlists</Link><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><ListVideo size={23} /></span><div><h1 className="text-3xl font-semibold tracking-tight text-slate-100">{playlist.playlistName}</h1><p className="mt-1 text-sm text-slate-500">{playlist.videos?.length || 0} videos</p></div></div>{playlist.playlistDescription && <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{playlist.playlistDescription}</p>}</div><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={onEdit}><Pencil size={15} />Edit</Button><Button size="sm" variant="danger" onClick={onDelete}><Trash2 size={15} />Delete</Button></div></div>;
}
