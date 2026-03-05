//music-mobile-app/app/%28tabs%29/library.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LibraryScreen() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Hàm load dữ liệu từ bộ nhớ điện thoại
  const loadPlaylists = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        setPlaylists(JSON.parse(storedData));
      } else {
        // Nếu chưa có gì, tạo mặc định 1 playlist Yêu thích
        const defaultPlaylist = [{ id: 'fav_1', name: 'Bài hát yêu thích ❤️', songIds: [] }];
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(defaultPlaylist));
        setPlaylists(defaultPlaylist);
      }
    } catch (error) {
      console.error("Lỗi tải thư viện:", error);
    }
  };

  // useFocusEffect giúp tự động load lại dữ liệu mỗi khi người dùng bấm vào Tab này
  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, [])
  );

  // Hàm tạo Playlist mới
  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập tên Playlist!');
      return;
    }
    const newPlaylist = {
      id: `pl_${Date.now()}`,
      name: newPlaylistName.trim(),
      songIds: []
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    await AsyncStorage.setItem('@my_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
    setNewPlaylistName('');
    setModalVisible(false);
  };

  // Hàm xóa Playlist (Không cho xóa playlist mặc định đầu tiên)
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
        {playlists.map((pl, index) => (
          <TouchableOpacity 
            key={pl.id} 
            style={styles.playlistCard}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/playlist-detail', params: { id: pl.id, name: pl.name } })}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={index === 0 ? "heart" : "musical-notes"} size={30} color={index === 0 ? "#ff4757" : "#7Ab2D3"} />
            </View>
            <View style={styles.info}>
              <Text style={styles.playlistName}>{pl.name}</Text>
              <Text style={styles.songCount}>{pl.songIds.length} bài hát</Text>
            </View>
            
            {index !== 0 && (
              <TouchableOpacity onPress={() => handleDeletePlaylist(pl.id, pl.name)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#ff4757" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL TẠO PLAYLIST */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo Playlist mới</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nhập tên Playlist..." 
              value={newPlaylistName} 
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreatePlaylist} style={styles.saveBtn}>
                <Text style={styles.saveText}>Tạo mới</Text>
              </TouchableOpacity>
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
  playlistCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconContainer: { width: 60, height: 60, backgroundColor: '#f0f9ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  playlistName: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
  songCount: { fontSize: 14, color: '#7f8c8d' },
  deleteBtn: { padding: 10 },

  // Modal Styles
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