//music-mobile-app/app/_layout.tsx
import { Stack, useRouter, usePathname } from 'expo-router'; // [UPDATED] Thêm usePathname
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { AudioProvider, AudioContext } from '../context/AudioContext';
import { useContext } from 'react';

const GlobalMiniPlayer = () => {
  const router = useRouter();
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  
  const { activeSong, isPlaying, togglePlayPause, getResourceUrl } = useContext(AudioContext);
  
  // 1. TẠO "DANH SÁCH ĐEN" CÁC TRANG MUỐN ẨN MINI PLAYER
  const hiddenPaths = [
    '/player',
    '/artist-detail',
    '/album-detail',
    '/category-detail',
    '/playlist-detail',
    '/search' // Tôi gợi ý ẩn luôn ở trang Search cho rộng chỗ gõ phím
  ];

  // 2. KIỂM TRA ĐIỀU KIỆN
  // Nếu chưa chọn nhạc HOẶC trang hiện tại nằm trong "danh sách đen" -> Trả về null (Ẩn đi)
  if (!activeSong || hiddenPaths.includes(pathname)) return null; 

  return (
    <TouchableOpacity 
      style={styles.miniPlayer} 
      activeOpacity={0.9} 
      onPress={() => router.push('/player')}
    >
      <Image source={{ uri: getResourceUrl(activeSong.image_url) }} style={styles.miniPlayerImage} />
      <View style={styles.miniPlayerInfo}>
        <Text style={styles.miniPlayerTitle} numberOfLines={1}>{activeSong.title}</Text>
        <Text style={styles.miniPlayerArtist} numberOfLines={1}>
          {activeSong.artists?.map((a: any) => a.name).join(', ') || 'Unknown'}
        </Text>
      </View>
      <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
        <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  return (
    <AudioProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ presentation: 'modal' }} />
          <Stack.Screen name="player" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="artist-detail" options={{ presentation: 'modal' }} />
          <Stack.Screen name="album-detail" options={{ presentation: 'modal' }} />
          <Stack.Screen name="category-detail" options={{ presentation: 'modal' }} />
          <Stack.Screen name="playlist-detail" options={{ presentation: 'modal' }} />
        </Stack>
        <GlobalMiniPlayer />
      </View>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute', bottom: 65, left: 0, right: 0,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    padding: 10, borderTopWidth: 1, borderTopColor: '#eee',
    elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  miniPlayerImage: { width: 40, height: 40, borderRadius: 20 },
  miniPlayerInfo: { flex: 1, marginLeft: 12 },
  miniPlayerTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  miniPlayerArtist: { fontSize: 13, color: '#666' },
  playButton: { width: 40, height: 40, backgroundColor: '#7Ab2D3', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  playButtonText: { color: '#fff', fontSize: 16 }
});