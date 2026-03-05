//music-mobile-app/app/player.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { AudioContext } from '../context/AudioContext';

export default function PlayerScreen() {
  const router = useRouter();
  const { 
    activeSong, isPlaying, position, duration, volume,
    togglePlayPause, playNext, playPrev, seekTo, setVolume, getResourceUrl 
  } = useContext(AudioContext);

  if (!activeSong) return null;

  // Hàm đổi mili-giây thành định dạng Phút:Giây (VD: 03:45)
  const formatTime = (millis: number) => {
    const mins = Math.floor(millis / 60000);
    const secs = ((millis % 60000) / 1000).toFixed(0);
    return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* Nút vuốt xuống để đóng */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Đang phát</Text>
      </View>

      {/* Ảnh bìa siêu to */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: getResourceUrl(activeSong.image_url) }} style={styles.coverImage} />
      </View>

      {/* Thông tin bài hát */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{activeSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>
          {activeSong.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}
        </Text>
      </View>

      {/* Thanh tua nhạc (Progress Bar) */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#7Ab2D3"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#7Ab2D3"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Bộ nút điều khiển (Prev, Play, Next) */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={playPrev} style={styles.controlBtn}>
          <Ionicons name="play-skip-back" size={36} color="#7Ab2D3" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={playNext} style={styles.controlBtn}>
          <Ionicons name="play-skip-forward" size={36} color="#7Ab2D3" />
        </TouchableOpacity>
      </View>

      {/* Thanh chỉnh âm lượng (Volume) */}
      <View style={styles.volumeContainer}>
        <Ionicons name="volume-low" size={24} color="#888" />
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onSlidingComplete={setVolume}
          minimumTrackTintColor="#888"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#888"
        />
        <Ionicons name="volume-high" size={24} color="#888" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fbfd', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  closeBtn: { position: 'absolute', left: 0, zIndex: 10 },
  headerText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#555', textTransform: 'uppercase' },
  imageContainer: { alignItems: 'center', marginBottom: 40 },
  coverImage: { width: 300, height: 300, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 10 },
  infoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 8, textAlign: 'center' },
  artist: { fontSize: 18, color: '#777' },
  progressContainer: { marginBottom: 30 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: -10 },
  timeText: { fontSize: 12, color: '#888' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  controlBtn: { padding: 20 },
  playBtn: { width: 70, height: 70, backgroundColor: '#7Ab2D3', borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: "#7Ab2D3", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5 },
  volumeContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 100 },
  volumeSlider: { flex: 1, marginHorizontal: 10 }
});