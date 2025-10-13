import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
}

interface PlaylistProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
}

export function Playlist({ songs, currentSong, isPlaying, onSongSelect }: PlaylistProps) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6 border-b">
        <h2>Your Playlist</h2>
        <p className="text-muted-foreground">{songs.length} songs</p>
      </div>
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="p-2">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`flex items-center gap-4 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                currentSong?.id === song.id ? 'bg-accent' : ''
              }`}
              onClick={() => onSongSelect(song)}
            >
              <div className="text-muted-foreground w-8 text-center">
                {currentSong?.id === song.id && isPlaying ? (
                  <Pause className="h-4 w-4 inline" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className={`truncate ${currentSong?.id === song.id ? 'text-primary' : ''}`}>
                  {song.title}
                </p>
                <p className="text-muted-foreground text-sm truncate">{song.artist}</p>
              </div>
              <div className="text-muted-foreground text-sm">{song.duration}</div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onSongSelect(song);
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
