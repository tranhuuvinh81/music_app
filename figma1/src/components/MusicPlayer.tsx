import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
}

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
}

export function MusicPlayer({
  currentSong,
  isPlaying,
  currentTime,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
}: MusicPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseDuration = (duration: string) => {
    const [mins, secs] = duration.split(':').map(Number);
    return mins * 60 + secs;
  };

  const totalDuration = currentSong ? parseDuration(currentSong.duration) : 0;

  return (
    <div className="border-t bg-card p-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={totalDuration}
            step={1}
            onValueChange={onSeek}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-muted-foreground">
            <span className="text-sm">{formatTime(currentTime)}</span>
            <span className="text-sm">{currentSong?.duration || '0:00'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1">
            {currentSong && (
              <>
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded object-cover"
                />
                <div>
                  <p className="text-foreground">{currentSong.title}</p>
                  <p className="text-muted-foreground text-sm">{currentSong.artist}</p>
                </div>
              </>
            )}
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onPrevious}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onNext}>
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={onVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
