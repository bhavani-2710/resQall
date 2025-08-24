import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#CF0F47',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#28282B',
          height: 80,
          paddingTop: 7
        },
        tabBarLabelStyle:{
          fontSize: 11,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome5 size={28} name="user-alt" color={color} />,
        }}
      />
    </Tabs>
  );
}
