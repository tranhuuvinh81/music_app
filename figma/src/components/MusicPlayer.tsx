import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
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

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number;
  onProgressChange: (value: number[]) => void;
  volume: number;
  onVolumeChange: (value: number[]) => void;
}

export function MusicPlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress,
  onProgressChange,
  volume,
  onVolumeChange,
}: MusicPlayerProps) {
  if (!currentSong) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-border bg-card p-6">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            onValueChange={onProgressChange}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-muted-foreground">
            <span className="text-[12px]">{formatTime((progress / 100) * 240)}</span>
            <span className="text-[12px]">4:00</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-8">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <ImageWithFallback
              src={currentSong.coverUrl}
              alt={currentSong.album}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="truncate">{currentSong.title}</h4>
              <p className="text-muted-foreground text-[14px] truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="h-10 w-10"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6" fill="currentColor" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="h-10 w-10"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVolumeChange(volume > 0 ? [0] : [70])}
              className="h-10 w-10"
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={onVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
