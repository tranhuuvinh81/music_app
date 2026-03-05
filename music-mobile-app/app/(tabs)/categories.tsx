//music-mobile-app/app/%28tabs%29/categories.tsx
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, ImageBackground, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../api/api';
import { AudioContext } from '../../context/AudioContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function CategoriesScreen() {
  const router = useRouter();
  const [genres, setGenres] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getResourceUrl } = useContext(AudioContext);

  useEffect(() => {
    // Tải tất cả bài hát để phân tích Thể loại và Quốc gia
    api.get("/api/songs")
      .then((res) => {
        const allSongs = res.data || [];
        const genreMap = new Map();
        const countryMap = new Map();

        allSongs.forEach((song: any) => {
          // 1. Phân loại theo Thể loại (TÁCH CHUỖI BẰNG DẤU PHẨY)
          if (song.genre && song.genre.trim() !== '') {
            // Cắt chuỗi bằng dấu phẩy, xóa khoảng trắng thừa ở 2 đầu, và loại bỏ phần tử rỗng
            const genresArray = song.genre.split(',').map((g: string) => g.trim()).filter(Boolean);
            
            genresArray.forEach((singleGenre: string) => {
              if (!genreMap.has(singleGenre)) {
                genreMap.set(singleGenre, { name: singleGenre, image_url: song.image_url, count: 1 });
              } else {
                genreMap.get(singleGenre).count += 1;
              }
            });
          }
          
          // 2. Phân loại theo Quốc gia (Cũng tách chuỗi đề phòng 1 bài nhiều quốc gia)
          if (song.country && song.country.trim() !== '') {
            const countriesArray = song.country.split(',').map((c: string) => c.trim()).filter(Boolean);
            
            countriesArray.forEach((singleCountry: string) => {
              if (!countryMap.has(singleCountry)) {
                countryMap.set(singleCountry, { name: singleCountry, image_url: song.image_url, count: 1 });
              } else {
                countryMap.get(singleCountry).count += 1;
              }
            });
          }
        });

        // Chuyển Map thành mảng để render
        setGenres(Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
        setCountries(Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải danh mục:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7Ab2D3" />
        <Text style={{ marginTop: 10 }}>Đang tải danh mục...</Text>
      </View>
    );
  }

  // Giao diện cho thẻ danh mục (dùng chung cho cả Quốc gia và Thể loại)
  const renderCategoryCard = (item: any, type: 'genre' | 'country', index: number) => (
    <TouchableOpacity 
      key={`${type}-${index}`} 
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={() => router.push({ 
        pathname: '/category-detail', 
        params: { type, name: item.name, image_url: item.image_url } 
      })}
    >
      <ImageBackground 
        source={{ uri: getResourceUrl(item.image_url) }} 
        style={styles.cardBg}
        imageStyle={{ borderRadius: 12 }}
      >
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.count} bài hát</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* PHẦN QUỐC GIA */}
        {countries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.headerTitle}>Quốc gia</Text>
            <View style={styles.gridContainer}>
              {countries.map((item, index) => renderCategoryCard(item, 'country', index))}
            </View>
          </View>
        )}

        {/* PHẦN THỂ LOẠI */}
        {genres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.headerTitle}>Thể loại Nhạc</Text>
            <View style={styles.gridContainer}>
              {genres.map((item, index) => renderCategoryCard(item, 'genre', index))}
            </View>
          </View>
        )}

        {countries.length === 0 && genres.length === 0 && (
          <View style={[styles.center, { marginTop: 50 }]}>
            <Text style={{ color: '#888' }}>Chưa có dữ liệu phân loại.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 16 },
  section: { marginBottom: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardContainer: { width: CARD_WIDTH, height: 110, marginBottom: 16, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 4 },
  cardBg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  cardOverlay: { backgroundColor: 'rgba(0,0,0,0.45)', padding: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, height: '100%', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  cardSubtitle: { fontSize: 12, color: '#eee', marginTop: 4 }
});