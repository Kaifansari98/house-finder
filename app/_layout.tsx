import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function RootLayout() {
  
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#fff" }, }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(public)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
