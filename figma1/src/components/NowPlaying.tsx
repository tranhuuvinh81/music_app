import { Heart, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
}

interface NowPlayingProps {
  currentSong: Song | null;
}

export function NowPlaying({ currentSong }: NowPlayingProps) {
  if (!currentSong) {
    return (
      <div className="bg-card rounded-lg border p-8 flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Select a song to start playing</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-8">
      <div className="flex flex-col items-center">
        <div className="relative group">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.album}
            className="w-64 h-64 rounded-lg shadow-2xl object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
        </div>
        <div className="mt-8 text-center w-full">
          <h1 className="mb-2">{currentSong.title}</h1>
          <p className="text-muted-foreground mb-6">{currentSong.artist}</p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
