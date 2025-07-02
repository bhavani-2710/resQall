import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from "../pages/Home"; // Make sure this matches your actual file
import Settings from "../pages/Settings";
import Emergency from "../pages/Emergency";


const Stack = createStackNavigator();

export default function Index() {
  return (
  
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={Settings} 
          options={{ 
            headerShown: true,
            title: 'Settings',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="Emergency" 
          component={Emergency} 
          options={{ 
            headerShown: false,
            gestureEnabled: false, // Prevent swipe back during emergency
          }} 
        />
        {/* <Stack.Screen 
          name="History" 
          component={History} 
          options={{ 
            headerShown: true,
            title: 'Emergency History',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
          }} 
        /> */}
        {/* <Stack.Screen 
          name="Test" 
          component={Test} 
          options={{ 
            headerShown: true,
            title: 'Test Emergency System',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
          }}  */}
        {/* /> */}
      </Stack.Navigator>
  
  );
}