//music-mobile-app/app/%28tabs%29/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: '#7Ab2D3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#fff', elevation: 3 },
        headerTitleStyle: { fontWeight: 'bold', color: '#333' },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Khám phá', 
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 15 }} 
              onPress={() => router.push('/search')}
            >
              <Ionicons name="search" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{ title: 'Nghệ sĩ nổi bật', tabBarLabel: 'Ca sĩ', tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="albums"
        options={{ title: 'Album thịnh hành', tabBarLabel: 'Album', tabBarIcon: ({ color }) => <Ionicons name="disc" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="categories"
        options={{ title: 'Quốc gia & Thể loại', tabBarLabel: 'Phân loại', tabBarIcon: ({ color }) => <Ionicons name="albums" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="library"
        options={{ title: 'Thư viện của bạn', tabBarLabel: 'Thư viện', tabBarIcon: ({ color }) => <Ionicons name="library" size={24} color={color} /> }}
      />
    </Tabs>
  );
}