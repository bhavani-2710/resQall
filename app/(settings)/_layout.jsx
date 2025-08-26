import { Stack } from "expo-router";
import "../../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="contacts" />
      <Stack.Screen name="emergency-code" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
