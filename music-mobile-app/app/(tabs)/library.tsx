import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioContext } from '../../context/AudioContext';

export default function LibraryScreen() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]); // State lịch sử
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { playSong, getResourceUrl } = useContext(AudioContext);

  const loadData = async () => {
    try {
      // Load Playlists
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        setPlaylists(JSON.parse(storedData));
      } else {
        const defaultPlaylist = [{ id: 'fav_1', name: 'Bài hát yêu thích ❤️', songIds: [] }];
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(defaultPlaylist));
        setPlaylists(defaultPlaylist);
      }

      // Load History
      const historyData = await AsyncStorage.getItem('@listening_history');
      if (historyData) setHistory(JSON.parse(historyData));
    } catch (error) {
      console.error("Lỗi tải thư viện:", error);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim() === '') return Alert.alert('Lỗi', 'Vui lòng nhập tên Playlist!');
    const newPlaylist = { id: `pl_${Date.now()}`, name: newPlaylistName.trim(), songIds: [] };
    const updatedPlaylists = [...playlists, newPlaylist];
    await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    setNewPlaylistName('');
    setModalVisible(false);
  };

  const handleDeletePlaylist = async (id: string, name: string) => {
    Alert.alert('Xác nhận', `Bạn có chắc muốn xóa playlist "${name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          const updatedPlaylists = playlists.filter(pl => pl.id !== id);
          await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
          setPlaylists(updatedPlaylists);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thư viện của bạn</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        
        {/* KHỐI LỊCH SỬ NGHE NHẠC (NẰM NGANG) */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Nghe gần đây</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {history.map((song, index) => (
                <TouchableOpacity key={song.id} style={styles.historyCard} onPress={() => playSong(song, history, index)}>
                  <Image source={{ uri: getResourceUrl(song.image_url) }} style={styles.historyImg} />
                  <Text style={styles.historyTitle} numberOfLines={1}>{song.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 15 }]}>Danh sách phát</Text>
        {playlists.map((pl, index) => (
          <TouchableOpacity key={pl.id} style={styles.playlistCard} activeOpacity={0.7} onPress={() => router.push({ pathname: '/playlist-detail', params: { id: pl.id, name: pl.name } })}>
            <View style={styles.iconContainer}><Ionicons name={index === 0 ? "heart" : "musical-notes"} size={30} color={index === 0 ? "#ff4757" : "#7Ab2D3"} /></View>
            <View style={styles.info}>
              <Text style={styles.playlistName}>{pl.name}</Text>
              <Text style={styles.songCount}>{pl.songIds.length} bài hát</Text>
            </View>
            {index !== 0 && (
              <TouchableOpacity onPress={() => handleDeletePlaylist(pl.id, pl.name)} style={styles.deleteBtn}><Ionicons name="trash-outline" size={20} color="#ff4757" /></TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo Playlist mới</Text>
            <TextInput style={styles.input} placeholder="Nhập tên Playlist..." value={newPlaylistName} onChangeText={setNewPlaylistName} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreatePlaylist} style={styles.saveBtn}><Text style={styles.saveText}>Tạo mới</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addBtn: { backgroundColor: '#7Ab2D3', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  
  listContainer: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 4 },
  
  // Style cho Lịch sử
  historySection: { marginBottom: 25 },
  historyCard: { width: 100, marginRight: 15, marginTop: 15 },
  historyImg: { width: 100, height: 100, borderRadius: 12, marginBottom: 8 },
  historyTitle: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },

  playlistCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconContainer: { width: 60, height: 60, backgroundColor: '#f0f9ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  playlistName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
  songCount: { fontSize: 14, color: '#7f8c8d' },
  deleteBtn: { padding: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', fontSize: 16, paddingVertical: 8, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { paddingHorizontal: 15, paddingVertical: 10 },
  cancelText: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#7Ab2D3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});