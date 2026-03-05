//music-mobile-app/app/search.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import api from '../api/api';
import { AudioContext } from '../context/AudioContext';
// [THÊM] Import Modal
import SongActionModal from '../components/SongActionModal';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [results, setResults] = useState({
    songs: [] as any[],
    artists: [] as any[],
    albums: [] as any[]
  });

  // [THÊM] State để mở Modal
  const [selectedSongForModal, setSelectedSongForModal] = useState<any>(null);

  const { activeSong, isPlaying, playSong, getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults({ songs: [], artists: [], albums: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => {
          setResults({
            songs: res.data.songs || [],
            artists: res.data.artists || [],
            albums: res.data.albums || []
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi tìm kiếm:", err);
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderSongItem = (song: any, index: number) => {
    const isThisSongPlaying = activeSong?.id === song.id;
    return (
      <View key={`song-${song.id}`} style={[styles.card, isThisSongPlaying && styles.cardActive]}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          // [UPDATED] Truyền playlist tìm kiếm vào để Next/Prev mượt mà
          onPress={() => playSong(song, results.songs, index)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: getResourceUrl(song.image_url) }} style={styles.coverImage} />
          <View style={styles.info}>
            <Text style={[styles.title, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{song.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
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

  const renderArtistItem = (artist: any) => (
    <TouchableOpacity 
      key={`artist-${artist.id}`} style={styles.card} activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/artist-detail', params: { id: artist.id, name: artist.name } })}
    >
      <Image source={{ uri: getResourceUrl(artist.image_url) }} style={styles.artistImage} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{artist.name}</Text>
        <Text style={styles.subtitle}>Nghệ sĩ</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderAlbumItem = (album: any, index: number) => (
    <TouchableOpacity 
      key={`album-${index}`} style={styles.card} activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/album-detail', params: { name: album.name, image_url: album.image_url } })}
    >
      <Image source={{ uri: getResourceUrl(album.image_url) }} style={styles.coverImage} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{album.name}</Text>
        <Text style={styles.subtitle}>Album</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const hasResults = results.songs.length > 0 || results.artists.length > 0 || results.albums.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Tìm bài hát, nghệ sĩ, album..." placeholderTextColor="#999" autoFocus value={searchQuery} onChangeText={setSearchQuery} />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7Ab2D3" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {!hasResults && searchQuery.trim() !== '' && (
             <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>Không tìm thấy kết quả nào cho "{searchQuery}"</Text>
             </View>
          )}

          {!hasResults && searchQuery.trim() === '' && (
             <View style={styles.emptyContainer}>
               <Ionicons name="musical-notes-outline" size={50} color="#ccc" style={{marginBottom: 10}} />
               <Text style={styles.emptyText}>Bắt đầu gõ để tìm kiếm âm nhạc</Text>
             </View>
          )}

          {results.songs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bài hát</Text>
              {results.songs.map((song, idx) => renderSongItem(song, idx))}
            </View>
          )}

          {results.artists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nghệ sĩ</Text>
              {results.artists.map(renderArtistItem)}
            </View>
          )}

          {results.albums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Album</Text>
              {results.albums.map(renderAlbumItem)}
            </View>
          )}

        </ScrollView>
      )}

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
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#eee',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
  },
  backButton: { marginRight: 12 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0',
    borderRadius: 20, paddingHorizontal: 12, height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  clearIcon: { padding: 4 },
  
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginLeft: 4 },
  
  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 12,
    marginBottom: 10, alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, 
  },
  cardActive: { borderColor: '#7Ab2D3', borderWidth: 1, backgroundColor: '#f0f9ff' },
  coverImage: { width: 50, height: 50, borderRadius: 8 },
  artistImage: { width: 50, height: 50, borderRadius: 25 },
  info: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7f8c8d' },
  playingIndicator: { fontSize: 16, color: '#7Ab2D3', marginRight: 10 },
  
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#888', fontSize: 16 }
});