//music-mobile-app/app/playlist-detail.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Image, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import api from '../api/api';
import { AudioContext } from '../context/AudioContext';

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); 
  
  const [playlistName, setPlaylistName] = useState(name as string);
  const [songs, setSongs] = useState<any[]>([]);
  const [allSongs, setAllSongs] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { activeSong, isPlaying, playSong, getResourceUrl, updatePlaylistOrder } = useContext(AudioContext);

  useEffect(() => {
    loadPlaylistData();
  }, [id]);

  const loadPlaylistData = async () => {
    try {
      const res = await api.get("/api/songs");
      const fetchedAllSongs = res.data || [];
      setAllSongs(fetchedAllSongs);

      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        const playlists = JSON.parse(storedData);
        const currentPlaylist = playlists.find((pl: any) => pl.id === id);
        
        if (currentPlaylist) {
          setPlaylistName(currentPlaylist.name);
          if (currentPlaylist.songIds.length > 0) {
            const matchedSongs = currentPlaylist.songIds
              .map((songId: number) => fetchedAllSongs.find((s: any) => s.id === songId))
              .filter(Boolean);
            setSongs(matchedSongs);
          } else {
            setSongs([]);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải dữ liệu playlist:", error);
      setLoading(false);
    }
  };

  // --- HÀM: ĐỔI TÊN PLAYLIST ---
  const handleRenamePlaylist = async () => {
    if (newPlaylistName.trim() === '') {
      Alert.alert('Lỗi', 'Tên playlist không được để trống!');
      return;
    }
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        const playlists = JSON.parse(storedData);
        const updatedPlaylists = playlists.map((pl: any) => 
          pl.id === id ? { ...pl, name: newPlaylistName.trim() } : pl
        );
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
        setPlaylistName(newPlaylistName.trim());
        setRenameModalVisible(false);
      }
    } catch (error) {
      console.error("Lỗi đổi tên:", error);
    }
  };

  // --- HÀM: XÓA TOÀN BỘ PLAYLIST ---
  const handleDeletePlaylist = () => {
    // Lưu ý: confirm dùng tốt cho Web, Alert dùng cho Mobile
    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc muốn xóa playlist "${playlistName}" không?`)) {
        executeDeletePlaylist();
      }
    } else {
      Alert.alert('Xóa Playlist', `Bạn có chắc muốn xóa playlist "${playlistName}"?`, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: executeDeletePlaylist }
      ]);
    }
  };

  const executeDeletePlaylist = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        const playlists = JSON.parse(storedData);
        const updatedPlaylists = playlists.filter((pl: any) => pl.id !== id);
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
        router.back(); // Xóa xong thì quay về trang trước
      }
    } catch (error) {
      console.error("Lỗi xóa playlist:", error);
    }
  };

  // --- HÀM: LƯU THỨ TỰ KÉO THẢ ---
  const handleReorder = async (newData: any[]) => {
    setSongs(newData);
    updatePlaylistOrder(newData); 
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        const playlists = JSON.parse(storedData);
        const newSongIds = newData.map(s => s.id);
        const updatedPlaylists = playlists.map((pl: any) => 
          pl.id === id ? { ...pl, songIds: newSongIds } : pl
        );
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
      }
    } catch (error) {
      console.error("Lỗi lưu thứ tự playlist:", error);
    }
  };

  // --- HÀM: XÓA BÀI HÁT KHỎI PLAYLIST ---
  const handleRemoveSong = (songIdToRemove: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Bỏ bài hát này khỏi playlist?')) {
        executeRemoveSong(songIdToRemove);
      }
    } else {
      Alert.alert('Xóa bài hát', 'Bạn có chắc muốn bỏ bài này khỏi playlist?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => executeRemoveSong(songIdToRemove) }
      ]);
    }
  };

  const executeRemoveSong = async (songIdToRemove: number) => {
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        const playlists = JSON.parse(storedData);
        const updatedPlaylists = playlists.map((pl: any) => {
          if (pl.id === id) return { ...pl, songIds: pl.songIds.filter((sid: number) => sid !== songIdToRemove) };
          return pl;
        });
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
        const updatedSongs = songs.filter(s => s.id !== songIdToRemove);
        setSongs(updatedSongs);
        updatePlaylistOrder(updatedSongs); 
      }
    } catch (error) {
      console.error("Lỗi xóa bài hát", error);
    }
  };

  // --- HÀM: THÊM BÀI HÁT ---
  const handleAddSong = async (songToAdd: any) => {
    if (songs.find(s => s.id === songToAdd.id)) {
      Platform.OS === 'web' ? window.alert('Bài hát đã có trong playlist này rồi!') : Alert.alert('Thông báo', 'Bài hát đã có trong playlist!');
      return;
    }
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        const playlists = JSON.parse(storedData);
        const updatedPlaylists = playlists.map((pl: any) => {
          if (pl.id === id) return { ...pl, songIds: [...pl.songIds, songToAdd.id] };
          return pl;
        });
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
        const updatedSongs = [...songs, songToAdd];
        setSongs(updatedSongs);
        updatePlaylistOrder(updatedSongs);
        Platform.OS === 'web' ? window.alert('Đã thêm bài hát!') : Alert.alert('Thành công', 'Đã thêm bài hát vào Playlist!');
      }
    } catch (error) {
      console.error("Lỗi thêm bài hát", error);
    }
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    playSong(shuffledSongs[0], shuffledSongs, 0);
  };

  const availableSongsToAdd = allSongs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !songs.find(cs => cs.id === s.id)
  );

  // --- GIAO DIỆN CHUNG CHO 1 BÀI HÁT ---
  const renderSongItemUI = (item: any, index: number, drag?: any, isActive?: boolean) => {
    const isThisSongPlaying = activeSong?.id === item.id;
    return (
      <View key={item.id} style={[styles.songCard, isThisSongPlaying && styles.songCardActive, isActive && styles.songCardDragging]}>
        
        {/* Nút kéo thả: Chỉ hiện trên Mobile */}
        {Platform.OS !== 'web' && drag && (
          <TouchableOpacity onLongPress={drag} delayLongPress={100} style={styles.dragHandle}>
            <Ionicons name="menu" size={24} color={isActive ? "#7Ab2D3" : "#ccc"} />
          </TouchableOpacity>
        )}

        {/* Khúc giữa: Nhấn để phát nhạc */}
        <TouchableOpacity style={styles.songMainClick} onPress={() => playSong(item, songs, index)} activeOpacity={0.7}>
          {Platform.OS === 'web' && <Text style={[styles.songIndex, isThisSongPlaying && { color: '#7Ab2D3' }]}>{index + 1}</Text>}
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>{item.artists?.map((a:any)=>a.name).join(', ') || 'Unknown'}</Text>
          </View>
          {isThisSongPlaying && isPlaying && <Text style={styles.playingIndicator}>▶</Text>}
        </TouchableOpacity>
        
        {/* Nút Xóa bài hát */}
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveSong(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#ff7675" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#7Ab2D3" /></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={32} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerTitleContainer} onPress={() => { setNewPlaylistName(playlistName); setRenameModalVisible(true); }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{playlistName}</Text>
          <Ionicons name="pencil" size={16} color="#888" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* NÚT XÓA PLAYLIST (Không cho xóa playlist yêu thích mặc định) */}
        {id !== 'fav_1' && (
          <TouchableOpacity onPress={handleDeletePlaylist} style={styles.deletePlaylistBtn}>
            <Ionicons name="trash" size={24} color="#ff7675" />
          </TouchableOpacity>
        )}
      </View>

      {/* ACTION BAR */}
      <View style={styles.actionContainer}>
        <Text style={styles.songCount}>{songs.length} bài hát</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.btnText}>Thêm bài hát</Text>
          </TouchableOpacity>
          {songs.length > 0 && (
            <TouchableOpacity style={styles.shuffleBtn} onPress={handleShufflePlay}>
              <Ionicons name="shuffle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* DANH SÁCH BÀI HÁT (THÍCH ỨNG WEB & MOBILE) */}
      <View style={{ flex: 1 }}>
        {songs.length > 0 ? (
          Platform.OS === 'web' ? (
            // DÙNG SCROLLVIEW TRÊN WEB ĐỂ CÓ THỂ LĂN CHUỘT
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
              {songs.map((item, index) => renderSongItemUI(item, index))}
            </ScrollView>
          ) : (
            // DÙNG DRAGGABLE TRÊN MOBILE ĐỂ KÉO THẢ
            <GestureHandlerRootView style={{ flex: 1 }}>
              <DraggableFlatList<any>
                data={songs}
                onDragEnd={({ data }) => handleReorder(data)}
                keyExtractor={(item, index) => `playlist-song-${item.id}-${index}`}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item, drag, isActive, getIndex }) => {
                  const index = getIndex() || 0;
                  return (
                    <ScaleDecorator>
                      {renderSongItemUI(item, index, drag, isActive)}
                    </ScaleDecorator>
                  );
                }}
              />
            </GestureHandlerRootView>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={50} color="#ccc" />
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 15 }}>
              Playlist của bạn đang trống.{"\n"}Nhấn "Thêm bài hát" để lấp đầy nhé!
            </Text>
          </View>
        )}
      </View>

      {/* --- CÁC MODAL GIỮ NGUYÊN NHƯ CŨ --- */}
      <Modal visible={isRenameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi tên Playlist</Text>
            <TextInput style={styles.input} value={newPlaylistName} onChangeText={setNewPlaylistName} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleRenamePlaylist} style={styles.saveBtn}><Text style={styles.saveText}>Lưu</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isAddModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.addModalContainer}>
          <View style={styles.addModalHeader}>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            <Text style={styles.addModalTitle}>Thêm bài hát</Text>
            <View style={{ width: 28 }} />
          </View>
          
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput style={{ flex: 1, fontSize: 16 }} placeholder="Tìm tên bài hát..." value={searchQuery} onChangeText={setSearchQuery} />
          </View>

          {/* Dùng ScrollView ở đây trên Web cho chắc chắn lăn chuột được */}
          {Platform.OS === 'web' ? (
             <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {availableSongsToAdd.length > 0 ? availableSongsToAdd.map(item => (
                  <View key={item.id} style={styles.addSongRow}>
                    <Image source={{ uri: getResourceUrl(item.image_url) }} style={styles.addSongImg} />
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.songArtist} numberOfLines={1}>{item.artists?.map((a:any)=>a.name).join(', ')}</Text>
                    </View>
                    <TouchableOpacity style={styles.addInlineBtn} onPress={() => handleAddSong(item)}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )) : <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Không tìm thấy bài hát phù hợp.</Text>}
             </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              {availableSongsToAdd.map(item => (
                  <View key={item.id} style={styles.addSongRow}>
                    <Image source={{ uri: getResourceUrl(item.image_url) }} style={styles.addSongImg} />
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.songArtist} numberOfLines={1}>{item.artists?.map((a:any)=>a.name).join(', ')}</Text>
                    </View>
                    <TouchableOpacity style={styles.addInlineBtn} onPress={() => handleAddSong(item)}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f9fbfd' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 15, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeBtn: { padding: 5 },
  headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', maxWidth: '80%' },
  deletePlaylistBtn: { padding: 5, marginLeft: 10 },
  
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  songCount: { fontSize: 15, color: '#666', fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7Ab2D3', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  shuffleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#555', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  
  songCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  songCardActive: { borderColor: '#7Ab2D3', borderWidth: 1, backgroundColor: '#f0f9ff' },
  songCardDragging: { backgroundColor: '#e0f2fe', elevation: 10, shadowOpacity: 0.2, transform: [{ scale: 1.02 }] },
  dragHandle: { padding: 15 },
  songMainClick: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  songIndex: { width: 30, fontSize: 16, fontWeight: 'bold', color: '#888', textAlign: 'center' },
  songInfo: { marginLeft: 5, flex: 1 },
  songTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  songArtist: { fontSize: 14, color: '#7f8c8d' },
  playingIndicator: { fontSize: 16, color: '#7Ab2D3', marginRight: 10 },
  removeBtn: { padding: 15, borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', fontSize: 16, paddingVertical: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { paddingHorizontal: 15, paddingVertical: 10 },
  cancelText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#7Ab2D3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  addModalContainer: { flex: 1, backgroundColor: '#f9fbfd', paddingTop: 20 },
  addModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  addModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9ecef', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 15, height: 45, marginBottom: 10 },
  addSongRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  addSongImg: { width: 45, height: 45, borderRadius: 8, marginRight: 15 },
  addInlineBtn: { width: 36, height: 36, backgroundColor: '#7Ab2D3', borderRadius: 18, justifyContent: 'center', alignItems: 'center' }
});