//music-mobile-app/app/album-detail.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { AudioContext } from '../context/AudioContext';
// [THÊM MỚI] Import Modal Tùy chọn
import SongActionModal from '../components/SongActionModal';

export default function AlbumDetailScreen() {
  const router = useRouter();
  const { name, image_url } = useLocalSearchParams(); 
  
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // [THÊM MỚI] State quản lý Modal
  const [selectedSongForModal, setSelectedSongForModal] = useState<any>(null);

  const { activeSong, isPlaying, playSong, getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    if (!name) return;

    api.get("/api/songs")
      .then((res) => {
        const allSongs = res.data || [];
        const albumSongs = allSongs.filter((song: any) => song.album === name);
        setSongs(albumSongs);
        setLoading(false);
      }).catch(err => {
        console.error("Lỗi tải chi tiết album:", err);
        setLoading(false);
      });
  }, [name]);

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffledSongs[0], shuffledSongs, 0);
  };

  const renderSongItem = (song: any, index: number) => {
    const isThisSongPlaying = activeSong?.id === song.id;

    return (
      <View key={song.id} style={[styles.songCard, isThisSongPlaying && styles.songCardActive]}>
        <TouchableOpacity 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => playSong(song, songs, index)}
          activeOpacity={0.7}
        >
          <Text style={[styles.songIndex, isThisSongPlaying && { color: '#7Ab2D3' }]}>{index + 1}</Text>
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{song.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {song.artists && song.artists.length > 0 ? song.artists.map((a: any) => a.name).join(', ') : 'Unknown'}
            </Text>
          </View>
          {isThisSongPlaying && isPlaying && <Text style={styles.playingIndicator}>▶</Text>}
        </TouchableOpacity>

        {/* NÚT 3 CHẤM */}
        <TouchableOpacity style={{ padding: 10 }} onPress={() => setSelectedSongForModal(song)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground 
        source={{ uri: getResourceUrl(image_url as string) }} 
        style={styles.headerBackground}
        blurRadius={20}
      >
        <View style={styles.overlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={32} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Image source={{ uri: getResourceUrl(image_url as string) }} style={styles.coverImage} />
          <Text style={styles.albumName}>{name}</Text>
          <Text style={styles.albumType}>Album • {songs.length} bài hát</Text>
          
          {songs.length > 0 && (
            <TouchableOpacity style={styles.shuffleBtn} onPress={handleShufflePlay}>
              <Ionicons name="shuffle" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.shuffleBtnText}>Phát ngẫu nhiên</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.songsSection}>
          {songs.length > 0 ? (
            songs.map((song, index) => renderSongItem(song, index))
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Không có bài hát nào trong Album này.</Text>
          )}
        </View>
      </ScrollView>

      {/* COMPONENT MODAL DÙNG CHUNG */}
      <SongActionModal 
        visible={!!selectedSongForModal} 
        song={selectedSongForModal} 
        onClose={() => setSelectedSongForModal(null)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f9fbfd' },
  
  headerBackground: { width: '100%', paddingTop: 40, paddingBottom: 30, alignItems: 'center', justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  closeBtn: { position: 'absolute', top: 40, left: 10, padding: 5, zIndex: 10 },
  headerContent: { alignItems: 'center', zIndex: 1, marginTop: 20 },
  coverImage: { width: 120, height: 120, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  albumName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5, textAlign: 'center', paddingHorizontal: 20 },
  albumType: { fontSize: 14, color: '#ddd', marginBottom: 20 },
  
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7Ab2D3', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  shuffleBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  scrollContent: { paddingBottom: 100 },
  songsSection: { padding: 16 },
  songCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  songCardActive: { borderColor: '#7Ab2D3', borderWidth: 1, backgroundColor: '#f0f9ff' },
  songIndex: { width: 30, fontSize: 16, fontWeight: 'bold', color: '#888', textAlign: 'center' },
  songInfo: { marginLeft: 10, flex: 1 },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#7f8c8d' },
  playingIndicator: { fontSize: 16, color: '#7Ab2D3', marginRight: 10 },
});