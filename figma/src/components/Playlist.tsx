import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  genre: string;
}

interface PlaylistProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
  onPlayPause: () => void;
  playlistTitle?: string;
  songCount?: number;
}

export function Playlist({
  songs,
  currentSong,
  isPlaying,
  onSongSelect,
  onPlayPause,
  playlistTitle = "Your Playlist",
  songCount,
}: PlaylistProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2>{playlistTitle}</h2>
          {songCount !== undefined && (
            <p className="text-muted-foreground mt-1">
              {songCount} {songCount === 1 ? "song" : "songs"}
            </p>
          )}
        </div>
        <div className="space-y-2">
          {songs.map((song) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={`flex items-center gap-4 p-4 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                  isCurrentSong ? "bg-accent" : ""
                }`}
                onClick={() => onSongSelect(song)}
              >
                <div className="relative group">
                  <ImageWithFallback
                    src={song.coverUrl}
                    alt={song.album}
                    className="w-14 h-14 rounded-md object-cover"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-md transition-opacity ${
                      isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentSong) {
                        onPlayPause();
                      } else {
                        onSongSelect(song);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-transparent hover:text-white"
                    >
                      {isCurrentSong && isPlaying ? (
                        <Pause className="h-4 w-4" fill="currentColor" />
                      ) : (
                        <Play className="h-4 w-4" fill="currentColor" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`truncate ${isCurrentSong ? "text-primary" : ""}`}>
                    {song.title}
                  </h4>
                  <p className="text-muted-foreground text-[14px] truncate">
                    {song.artist}
                  </p>
                </div>
                <div className="text-muted-foreground text-[14px]">{song.duration}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
