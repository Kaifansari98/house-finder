import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import NotificationBootstrap from "@/components/notifications/NotificationBootstrap";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <NotificationBootstrap />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(public)" />
          </Stack>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
