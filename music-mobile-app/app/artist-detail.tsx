//music-mobile-app/app/artist-detail.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { AudioContext } from '../context/AudioContext';
// [THÊM MỚI] Import Modal Tùy chọn
import SongActionModal from '../components/SongActionModal';

export default function ArtistDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); 
  
  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // [THÊM MỚI] State quản lý Modal
  const [selectedSongForModal, setSelectedSongForModal] = useState<any>(null);

  const { activeSong, isPlaying, playSong, getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    if (!id || !name) return;

    Promise.all([
      api.get(`/api/artists/${id}`),
      api.get(`/api/songs/artist/${encodeURIComponent(name as string)}`) 
    ]).then(([artistRes, songsRes]) => {
      setArtist(artistRes.data);
      setSongs(songsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error("Lỗi tải chi tiết nghệ sĩ:", err);
      setLoading(false);
    });
  }, [id, name]);

  const renderSongItem = (song: any, index: number) => {
    const isThisSongPlaying = activeSong?.id === song.id;

    return (
      <View key={song.id} style={[styles.songCard, isThisSongPlaying && styles.songCardActive]}>
        {/* Phần bấm để phát nhạc */}
        <TouchableOpacity 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => playSong(song, songs, index)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: getResourceUrl(song.image_url) }} style={styles.songCover} />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{song.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {song.artists && song.artists.length > 0 ? song.artists.map((a: any) => a.name).join(', ') : artist?.name}
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

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffledSongs[0], shuffledSongs, 0);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy nghệ sĩ này.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}><Text style={{ color: '#7Ab2D3' }}>Quay lại</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={32} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Nghệ sĩ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image source={{ uri: getResourceUrl(artist.image_url) }} style={styles.avatar} />
          <Text style={styles.artistName}>{artist.name}</Text>
          
          <View style={styles.tagsContainer}>
            {artist.field && <Text style={styles.tag}>{artist.field}</Text>}
            {artist.country && <Text style={styles.tag}>{artist.country}</Text>}
            {artist.birth_year && <Text style={styles.tag}>{artist.birth_year}</Text>}
          </View>

          {artist.description ? (
            <Text style={styles.description}>{artist.description}</Text>
          ) : (
            <Text style={[styles.description, { fontStyle: 'italic', color: '#aaa' }]}>Chưa có thông tin giới thiệu.</Text>
          )}
          {songs.length > 0 && (
            <TouchableOpacity style={styles.shuffleBtn} onPress={handleShufflePlay}>
              <Ionicons name="shuffle" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.shuffleBtnText}>Phát ngẫu nhiên</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.songsSection}>
          <Text style={styles.sectionTitle}>Bài hát nổi bật</Text>
          {songs.length > 0 ? (
            songs.map((song, index) => renderSongItem(song, index))
          ) : (
            <View style={styles.emptySongs}>
              <Ionicons name="musical-notes-outline" size={40} color="#ddd" />
              <Text style={{ color: '#888', marginTop: 10 }}>Nghệ sĩ này chưa có bài hát nào.</Text>
            </View>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, paddingBottom: 10, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeBtn: { padding: 5, zIndex: 10 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#555', marginLeft: -35 },
  scrollContent: { paddingBottom: 100 },
  
  profileSection: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  avatar: { width: 150, height: 150, borderRadius: 75, marginBottom: 15, borderWidth: 3, borderColor: '#f0f9ff' },
  artistName: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 15 },
  tag: { backgroundColor: '#f0f9ff', color: '#7Ab2D3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, fontSize: 13, fontWeight: 'bold', overflow: 'hidden' },
  description: { textAlign: 'justify', color: '#666', lineHeight: 22, fontSize: 14, paddingHorizontal: 10 },
  
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7Ab2D3', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 30, marginTop: 20, shadowColor: "#7Ab2D3", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  shuffleBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  songsSection: { padding: 16, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  emptySongs: { alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#fff', borderRadius: 12 },
  songCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  songCardActive: { borderColor: '#7Ab2D3', borderWidth: 1, backgroundColor: '#f0f9ff' },
  songCover: { width: 50, height: 50, borderRadius: 8 },
  songInfo: { marginLeft: 15, flex: 1 },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#7f8c8d' },
  playingIndicator: { fontSize: 16, color: '#7Ab2D3', marginRight: 10 },
});