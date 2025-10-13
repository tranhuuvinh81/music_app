import { useState, useEffect } from "react";
import { MusicPlayer } from "./components/MusicPlayer";
import { Playlist } from "./components/Playlist";
import { NowPlaying } from "./components/NowPlaying";
import { Music } from "lucide-react";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
}


export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
  const fetchSongs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/songs");
      if (!response.ok) throw new Error("Failed to fetch songs");
      const data: Song[] = await response.json();
      setSongs(data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  fetchSongs();
}, []);

  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;

    if (isPlaying && currentSong) {
      const [mins, secs] = currentSong.duration.split(':').map(Number);
      const totalDuration = mins * 60 + secs;

      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSongSelect = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
  if (!currentSong || songs.length === 0) return;
  const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
  const nextIndex = (currentIndex + 1) % songs.length;
  setCurrentSong(songs[nextIndex]);
  setCurrentTime(0);
  setIsPlaying(true);
};

const handlePrevious = () => {
  if (!currentSong || songs.length === 0) return;
  const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
  const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
  setCurrentSong(songs[prevIndex]);
  setCurrentTime(0);
  setIsPlaying(true);
};

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1>Music Player</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <NowPlaying currentSong={currentSong} />
          <Playlist
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSongSelect={handleSongSelect}
          />
        </div>
      </main>

      {/* Music Player Footer */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}
