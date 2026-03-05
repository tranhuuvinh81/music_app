//music-mobile-app/app/%28tabs%29/categories.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function CategoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Màn hình Thể loại & Quốc gia sẽ nằm ở đây! 🌍</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#666' }
});