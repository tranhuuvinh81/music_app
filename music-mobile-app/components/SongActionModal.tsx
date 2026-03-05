//music-mobile-app/components/SongActionModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export default function SongActionModal({ visible, song, onClose, initialView = 'MENU' }: any) {
  const [viewMode, setViewMode] = useState<'MENU' | 'PLAYLISTS' | 'INFO'>(initialView);
  const [playlists, setPlaylists] = useState<any[]>([]);

  // Hàm chuyên biệt chỉ dùng để lấy dữ liệu (không tự chuyển trang)
  const fetchPlaylists = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      if (storedData) {
        setPlaylists(JSON.parse(storedData));
      } else {
        const defaultPlaylist = [{ id: 'fav_1', name: 'Bài hát yêu thích ❤️', songIds: [] }];
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(defaultPlaylist));
        setPlaylists(defaultPlaylist);
      }
    } catch (error) {
      console.error("Lỗi tải playlist:", error);
    }
  };

  // Kích hoạt ngay khi Modal mở lên
  useEffect(() => {
    if (visible) {
      setViewMode(initialView);
      // Nếu được lệnh mở thẳng vào PLAYLISTS (từ màn hình Player), lập tức fetch dữ liệu!
      if (initialView === 'PLAYLISTS') {
        fetchPlaylists();
      }
    }
  }, [visible, initialView]);

  // Hàm xử lý khi bấm từ màn hình MENU
  const handleOpenPlaylistsFromMenu = async () => {
    await fetchPlaylists();
    setViewMode('PLAYLISTS');
  };

  const getResourceUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    try {
      const storedData = await AsyncStorage.getItem('@my_playlists');
      let currentPlaylists = storedData ? JSON.parse(storedData) : [];
      
      const targetPlaylist = currentPlaylists.find((p: any) => p.id === playlistId);
      if (targetPlaylist) {
        if (targetPlaylist.songIds.includes(song.id)) {
          Alert.alert("Thông báo", "Bài hát đã có trong danh sách này rồi!");
          return;
        }
        targetPlaylist.songIds.push(song.id);
        await AsyncStorage.setItem('@my_playlists', JSON.stringify(currentPlaylists));
        Alert.alert("Thành công", `Đã thêm bài hát vào "${playlistName}"`);
        onClose(); // Đóng modal sau khi thêm
      }
    } catch (error) {
      console.error("Lỗi lưu bài hát:", error);
    }
  };

  if (!visible || !song) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            
            {/* --- MÀN HÌNH 1: MENU CHÍNH --- */}
            {viewMode === 'MENU' && (
              <View>
                <View style={styles.headerInfo}>
                  <Image source={{ uri: getResourceUrl(song.image_url) }} style={styles.songImage} />
                  <View style={styles.headerText}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                      {song.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                
                {/* [ĐÃ SỬA LẠI SỰ KIỆN GỌI HÀM] */}
                <TouchableOpacity style={styles.actionRow} onPress={handleOpenPlaylistsFromMenu}>
                  <Ionicons name="add-circle-outline" size={26} color="#333" />
                  <Text style={styles.actionText}>Thêm vào Playlist / Yêu thích</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={() => setViewMode('INFO')}>
                  <Ionicons name="information-circle-outline" size={26} color="#333" />
                  <Text style={styles.actionText}>Xem thông tin bài hát</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- MÀN HÌNH 2: CHỌN PLAYLIST --- */}
            {viewMode === 'PLAYLISTS' && (
              <View style={{ maxHeight: 400 }}>
                <View style={styles.subHeader}>
                  <TouchableOpacity onPress={() => setViewMode('MENU')}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.subHeaderTitle}>Chọn Playlist</Text>
                  <View style={{ width: 24 }} />
                </View>
                <ScrollView>
                  {playlists.map((pl, index) => (
                    <TouchableOpacity key={pl.id} style={styles.playlistRow} onPress={() => handleAddToPlaylist(pl.id, pl.name)}>
                      <Ionicons name={index === 0 ? "heart" : "list"} size={24} color={index === 0 ? "#ff4757" : "#7Ab2D3"} />
                      <Text style={styles.playlistText}>{pl.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* --- MÀN HÌNH 3: THÔNG TIN CHI TIẾT --- */}
            {viewMode === 'INFO' && (
              <View>
                <View style={styles.subHeader}>
                  <TouchableOpacity onPress={() => setViewMode('MENU')}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.subHeaderTitle}>Thông tin Bài hát</Text>
                  <View style={{ width: 24 }} />
                </View>
                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Tên bài hát:</Text><Text style={styles.infoValue}>{song.title}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Nghệ sĩ:</Text><Text style={styles.infoValue}>{song.artists?.map((a: any) => a.name).join(', ') || 'Đang cập nhật'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Album:</Text><Text style={styles.infoValue}>{song.album || 'Đĩa đơn'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Thể loại:</Text><Text style={styles.infoValue}>{song.genre || 'Đang cập nhật'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Quốc gia:</Text><Text style={styles.infoValue}>{song.country || 'Đang cập nhật'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Năm phát hành:</Text><Text style={styles.infoValue}>{song.release_year || 'Đang cập nhật'}</Text></View>
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Lượt nghe:</Text><Text style={styles.infoValue}>{song.listen_count?.toLocaleString() || 0}</Text></View>
                </View>
              </View>
            )}

          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, minHeight: 250 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  songImage: { width: 50, height: 50, borderRadius: 8 },
  headerText: { marginLeft: 15, flex: 1 },
  songTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  songArtist: { fontSize: 14, color: '#777', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  actionText: { fontSize: 16, marginLeft: 15, color: '#333', fontWeight: '500' },

  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  subHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  playlistText: { fontSize: 16, marginLeft: 15, color: '#333' },

  infoContainer: { backgroundColor: '#f9fbfd', padding: 15, borderRadius: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 14, color: '#888', flex: 1 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: 'bold', flex: 2, textAlign: 'right' },
});