import { useState, useEffect, useMemo } from "react";
import { MusicPlayer } from "./components/MusicPlayer";
import { Playlist } from "./components/Playlist";
import { CategorySidebar } from "./components/CategorySidebar";
import { Music, Search } from "lucide-react";
import { Input } from "./components/ui/input";
import axios from "axios";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  genre: string;
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState(songs[0] as Song);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await axios.get<Song[]>("http://localhost:5000/api/songs");
        setSongs(res.data);
        setCurrentSong(res.data[0]); // chọn bài đầu tiên
      } catch (err) {
        console.error("Failed to fetch songs", err);
      }
    };

    fetchSongs();
  }, []);


  // Get unique genres and their counts
  const categories = useMemo(() => {
    const genreCounts = songs.reduce((acc, song) => {

      acc[song.genre] = (acc[song.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryList = [
      { id: "all", name: "All Songs", icon: Music, count: songs.length },
      { id: "vpop", name: "V-Pop", icon: Music, count: genreCounts.rock || 0 },
      { id: "kpop", name: "K-Pop", icon: Music, count: genreCounts.jazz || 0 },
      { id: "usuk", name: "US-UK", icon: Music, count: genreCounts.classical || 0 },
      { id: "dalab", name: "Da Lab", icon: Music, count: genreCounts.electronic || 0 },
      { id: "pop", name: "Pop", icon: Music, count: genreCounts.pop || 0 },
      { id: "others", name: "Others", icon: Music, count: genreCounts.folk || 0 },
    ];

    return categoryList;
  }, [songs]);

  // Filter songs based on category and search
  const filteredSongs = useMemo(() => {
    let filtered = songs;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((song) => song.genre === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Get playlist title
  const playlistTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `Search results for "${searchQuery}"`;
    }
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.name || "Your Playlist";
  }, [selectedCategory, searchQuery, categories]);

  // Simulate progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, filteredSongs, currentSong]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const currentIndex = filteredSongs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1) {
      // Current song not in filtered list, play first song
      if (filteredSongs.length > 0) {
        setCurrentSong(filteredSongs[0]);
        setProgress(0);
        setIsPlaying(true);
      }
      return;
    }
    const nextIndex = (currentIndex + 1) % filteredSongs.length;
    setCurrentSong(filteredSongs[nextIndex]);
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    const currentIndex = filteredSongs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1) {
      // Current song not in filtered list, play first song
      if (filteredSongs.length > 0) {
        setCurrentSong(filteredSongs[0]);
        setProgress(0);
        setIsPlaying(true);
      }
      return;
    }
    const prevIndex = currentIndex === 0 ? filteredSongs.length - 1 : currentIndex - 1;
    setCurrentSong(filteredSongs[prevIndex]);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Clear search when changing category
  };

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            <h1>MusicStream</h1>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        <Playlist
          songs={filteredSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onSongSelect={handleSongSelect}
          onPlayPause={handlePlayPause}
          playlistTitle={playlistTitle}
          songCount={filteredSongs.length}
        />
      </div>

      {/* Player */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        progress={progress}
        onProgressChange={handleProgressChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
}
