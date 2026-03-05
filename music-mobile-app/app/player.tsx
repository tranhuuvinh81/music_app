//music-mobile-app/app/player.tsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { AudioContext } from '../context/AudioContext';
import SongActionModal from '../components/SongActionModal';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const { 
    activeSong, isPlaying, position, duration, volume, currentPlaylist, 
    togglePlayPause, playNext, playPrev, seekTo, setVolume, getResourceUrl, playSong,
    updatePlaylistOrder 
  } = useContext(AudioContext);

  const [activeTab, setActiveTab] = useState<'player' | 'playlist' | 'lyrics'>('player');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInitialView, setModalInitialView] = useState<'MENU' | 'PLAYLISTS' | 'INFO'>('MENU');

  // --- STATES CHO LỜI BÀI HÁT ---
  const [parsedLyrics, setParsedLyrics] = useState<{time: number, text: string}[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);
  const [isFetchingLyrics, setIsFetchingLyrics] = useState<boolean>(false);
  
  // Dùng để tự động cuộn FlatList của lời bài hát
  const lyricsListRef = useRef<FlatList>(null);

  // 1. HÀM PHÂN TÍCH ĐỊNH DẠNG .LRC
  const parseLrc = (lrcString: string) => {
    const lines = lrcString.split('\n');
    const result: {time: number, text: string}[] = [];
    // Biểu thức chính quy (Regex) bắt định dạng [mm:ss.xx]
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    lines.forEach(line => {
      const match = regex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        let hundredths = parseInt(match[3], 10);
        // Đổi ra mili-giây chuẩn (có lúc đuôi là 2 số, có lúc 3 số)
        const milliseconds = match[3].length === 2 ? hundredths * 10 : hundredths;
        
        const time = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
        const text = match[4].trim();
        
        if (text) {
          result.push({ time, text });
        }
      }
    });
    return result;
  };

  // 2. TẢI VÀ GIẢI MÃ LỜI BÀI HÁT KHI ĐỔI BÀI MỚI
  useEffect(() => {
    if (activeSong && activeSong.lyrics_url) {
      setIsFetchingLyrics(true);
      setParsedLyrics([]);
      setActiveLyricIndex(-1);
      
      const url = getResourceUrl(activeSong.lyrics_url);
      fetch(url)
        .then((response) => response.text())
        .then((text) => {
          // Kiểm tra xem file có phải dạng LRC không
          if (text.includes('[00:')) {
            setParsedLyrics(parseLrc(text));
          } else {
            // Nếu là file txt bình thường không có thời gian
            setParsedLyrics([{ time: 0, text: text }]); 
          }
          setIsFetchingLyrics(false);
        })
        .catch((error) => {
          console.error("Lỗi tải lời bài hát:", error);
          setIsFetchingLyrics(false);
        });
    } else {
      setParsedLyrics([]);
    }
  }, [activeSong]);

  // 3. ĐỒNG BỘ THỜI GIAN NHẠC VỚI LỜI (KARAOKE SYNC)
  useEffect(() => {
    if (parsedLyrics.length > 1 && isPlaying) {
      let newIndex = -1;
      // Tìm dòng chữ có thời gian gần nhất với thời gian đang phát
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (position >= parsedLyrics[i].time) {
          newIndex = i;
        } else {
          break; // Dừng lại khi thời gian dòng đó lớn hơn thời gian hiện tại
        }
      }

      // Nếu chuyển sang câu hát mới -> Cập nhật UI và cuộn
      if (newIndex !== activeLyricIndex && newIndex !== -1) {
        setActiveLyricIndex(newIndex);
        
        // Tự động cuộn lời bài hát ra giữa màn hình
        if (activeTab === 'lyrics' && lyricsListRef.current) {
          lyricsListRef.current.scrollToIndex({
            index: newIndex,
            animated: true,
            viewPosition: 0.5 // 0.5 nghĩa là cuộn ra chính giữa màn hình
          });
        }
      }
    }
  }, [position, parsedLyrics, activeTab]);

  if (!activeSong) return null;

  const formatTime = (millis: number) => {
    const mins = Math.floor(millis / 60000);
    const secs = ((millis % 60000) / 1000).toFixed(0);
    return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}`;
  };

  const openModal = (view: 'PLAYLISTS' | 'INFO') => {
    setModalInitialView(view);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* HEADER TÍCH HỢP TABS */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={32} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'player' && styles.activeTabBtn]} onPress={() => setActiveTab('player')}>
            <Text style={[styles.tabText, activeTab === 'player' && styles.activeTabText]}>Trình phát</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'lyrics' && styles.activeTabBtn]} onPress={() => setActiveTab('lyrics')}>
            <Text style={[styles.tabText, activeTab === 'lyrics' && styles.activeTabText]}>Lời bài hát</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'playlist' && styles.activeTabBtn]} onPress={() => setActiveTab('playlist')}>
            <Text style={[styles.tabText, activeTab === 'playlist' && styles.activeTabText]}>Danh sách</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB 1: TRÌNH PHÁT */}
      {activeTab === 'player' && (
        <View style={styles.playerWrapper}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: getResourceUrl(activeSong.image_url) }} style={styles.coverImage} />
          </View>
          
          <View style={styles.bottomControlsWrapper}>
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={1}>{activeSong.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{activeSong.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}</Text>
            </View>

            <View style={styles.actionBar}>
              <TouchableOpacity onPress={() => openModal('PLAYLISTS')} style={styles.actionIcon}><Ionicons name="add-circle-outline" size={26} color="#555" /></TouchableOpacity>
              <TouchableOpacity onPress={() => openModal('PLAYLISTS')} style={styles.actionIcon}><Ionicons name="heart-outline" size={26} color="#555" /></TouchableOpacity>
              <TouchableOpacity onPress={() => openModal('INFO')} style={styles.actionIcon}><Ionicons name="information-circle-outline" size={26} color="#555" /></TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <Slider style={styles.slider} minimumValue={0} maximumValue={duration} value={position} onSlidingComplete={seekTo} minimumTrackTintColor="#7Ab2D3" maximumTrackTintColor="#ddd" thumbTintColor="#7Ab2D3" />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={playPrev} style={styles.controlBtn}><Ionicons name="play-skip-back" size={32} color="#333" /></TouchableOpacity>
              <TouchableOpacity onPress={togglePlayPause} style={styles.playBtn}><Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" /></TouchableOpacity>
              <TouchableOpacity onPress={playNext} style={styles.controlBtn}><Ionicons name="play-skip-forward" size={32} color="#333" /></TouchableOpacity>
            </View>

            <View style={styles.volumeContainer}>
              <Ionicons name="volume-low" size={20} color="#888" />
              <Slider style={styles.volumeSlider} minimumValue={0} maximumValue={1} value={volume} onSlidingComplete={setVolume} minimumTrackTintColor="#888" maximumTrackTintColor="#ddd" thumbTintColor="#888" />
              <Ionicons name="volume-high" size={20} color="#888" />
            </View>
          </View>
        </View>
      )}

      {/* TAB 2: LỜI BÀI HÁT (KARAOKE MODE) */}
      {activeTab === 'lyrics' && (
        <View style={styles.lyricsContainer}>
          <Text style={styles.lyricsHeader}>{activeSong.title}</Text>
          
          {isFetchingLyrics ? (
            <ActivityIndicator size="large" color="#7Ab2D3" style={{ marginTop: 50 }} />
          ) : parsedLyrics.length > 0 ? (
            parsedLyrics.length === 1 ? (
              // Nếu là file txt thường (không có timestamp) thì in ra cuộn bình thường
              <ScrollView contentContainerStyle={styles.lyricsScrollContent}>
                <Text style={styles.lyricLineNormal}>{parsedLyrics[0].text}</Text>
              </ScrollView>
            ) : (
              // Nếu là file LRC chuẩn -> Chạy chế độ Karaoke Auto-Scroll
              <FlatList
                ref={lyricsListRef}
                data={parsedLyrics}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.lyricsScrollContent}
                showsVerticalScrollIndicator={false}
                // Giúp tránh lỗi crash nếu chưa render kịp mà đã cuộn
                onScrollToIndexFailed={(info) => {
                  setTimeout(() => {
                    lyricsListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                  }, 500);
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity 
                    onPress={() => seekTo(item.time)} // Bấm vào câu nào, tua nhạc tới câu đó
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.lyricLineKaraoke, 
                      index === activeLyricIndex && styles.activeLyricLineKaraoke
                    ]}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )
          ) : (
            <View style={styles.noLyricsContainer}>
              <Ionicons name="mic-off-outline" size={50} color="#ccc" />
              <Text style={styles.noLyricsText}>Chưa có lời bài hát cho ca khúc này.</Text>
            </View>
          )}
        </View>
      )}

      {/* TAB 3: DANH SÁCH PHÁT (KÉO THẢ) */}
      {activeTab === 'playlist' && (
        <View style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.playlistHeader}>Tiếp theo ({currentPlaylist.length} bài)</Text>
          
          {Platform.OS !== 'web' && (
            <Text style={{ fontSize: 12, color: '#888', marginLeft: 5, marginBottom: 15 }}>Nhấn giữ biểu tượng ☰ để sắp xếp lại thứ tự phát</Text>
          )}

          {Platform.OS === 'web' ? (
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
              {currentPlaylist.map((item: any, index: number) => {
                const isThisSongPlaying = activeSong.id === item.id;
                return (
                  <TouchableOpacity key={`web-item-${item.id}-${index}`} activeOpacity={0.9} style={[styles.songRow, isThisSongPlaying && styles.songRowActive]} onPress={() => playSong(item, currentPlaylist, index)}>
                    <Image source={{ uri: getResourceUrl(item.image_url) }} style={styles.songRowImg} />
                    <View style={styles.songRowInfo}>
                      <Text style={[styles.songRowTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.songRowArtist} numberOfLines={1}>{item.artists?.map((a:any)=>a.name).join(', ') || 'Unknown'}</Text>
                    </View>
                    {isThisSongPlaying && <Ionicons name="musical-note" size={20} color="#7Ab2D3" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <GestureHandlerRootView style={{ flex: 1 }}>
              <DraggableFlatList<any>
                data={currentPlaylist}
                onDragEnd={({ data }) => updatePlaylistOrder(data)} 
                keyExtractor={(item, index) => `draggable-item-${item.id}-${index}`}
                contentContainerStyle={{ paddingBottom: 50 }}
                renderItem={({ item, drag, isActive, getIndex }) => {
                  const index = getIndex();
                  if (index === undefined) return null;
                  const isThisSongPlaying = activeSong.id === item.id;
                  return (
                    <ScaleDecorator>
                      <TouchableOpacity activeOpacity={0.9} style={[styles.songRow, isThisSongPlaying && styles.songRowActive, isActive && { backgroundColor: '#f0f9ff', elevation: 10, shadowOpacity: 0.2, transform: [{ scale: 1.02 }] }]} onPress={() => playSong(item, currentPlaylist, index)}>
                        <TouchableOpacity onLongPress={drag} delayLongPress={100} style={{ padding: 10, marginLeft: -10 }}><Ionicons name="menu" size={24} color={isActive ? "#7Ab2D3" : "#ccc"} /></TouchableOpacity>
                        <Image source={{ uri: getResourceUrl(item.image_url) }} style={styles.songRowImg} />
                        <View style={styles.songRowInfo}>
                          <Text style={[styles.songRowTitle, isThisSongPlaying && { color: '#7Ab2D3' }]} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.songRowArtist} numberOfLines={1}>{item.artists?.map((a:any)=>a.name).join(', ') || 'Unknown'}</Text>
                        </View>
                        {isThisSongPlaying && <Ionicons name="musical-note" size={20} color="#7Ab2D3" />}
                      </TouchableOpacity>
                    </ScaleDecorator>
                  );
                }}
              />
            </GestureHandlerRootView>
          )}
        </View>
      )}

      {/* MODAL TÙY CHỌN */}
      <SongActionModal visible={modalVisible} song={activeSong} onClose={() => setModalVisible(false)} initialView={modalInitialView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fbfd', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, position: 'relative' },
  closeBtn: { position: 'absolute', left: -10, zIndex: 10, padding: 10 },
  tabContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9ecef', borderRadius: 20, marginHorizontal: 30, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 16 },
  activeTabBtn: { backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#333' },

  playerWrapper: { flex: 1, justifyContent: 'space-between' },
  imageWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  coverImage: { width: '100%', maxWidth: width * 0.5, aspectRatio: 1, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 10 },
  bottomControlsWrapper: { paddingBottom: 10 },
  infoContainer: { alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
  artist: { fontSize: 16, color: '#777' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 15, paddingHorizontal: 40 },
  actionIcon: { padding: 5 },
  progressContainer: { marginBottom: 15 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: -10 },
  timeText: { fontSize: 12, color: '#888' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 20 },
  controlBtn: { padding: 15 },
  playBtn: { width: 64, height: 64, backgroundColor: '#7Ab2D3', borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  volumeContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  volumeSlider: { flex: 1, marginHorizontal: 10 },

  // --- LYRICS STYLES ---
  lyricsContainer: { flex: 1, marginTop: 10, backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  lyricsHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  lyricsScrollContent: { paddingVertical: 40 },
  lyricLineNormal: { fontSize: 16, lineHeight: 32, color: '#555', textAlign: 'center' }, // Cho file txt thường
  lyricLineKaraoke: { fontSize: 18, lineHeight: 40, color: '#ccc', textAlign: 'center', fontWeight: '500' }, // Chữ mờ khi chưa hát tới
  activeLyricLineKaraoke: { fontSize: 22, color: '#7Ab2D3', fontWeight: 'bold', transform: [{ scale: 1.05 }] }, // Phóng to, đổi màu câu đang hát
  noLyricsContainer: { alignItems: 'center', marginTop: 50 },
  noLyricsText: { fontSize: 15, color: '#888', marginTop: 15 },

  playlistContainer: { flex: 1, marginTop: 10 },
  playlistHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginLeft: 5 },
  songRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  songRowActive: { borderColor: '#7Ab2D3', borderWidth: 1, backgroundColor: '#f0f9ff' },
  songRowImg: { width: 45, height: 45, borderRadius: 8 },
  songRowInfo: { flex: 1, marginLeft: 15 },
  songRowTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  songRowArtist: { fontSize: 13, color: '#888' }
});