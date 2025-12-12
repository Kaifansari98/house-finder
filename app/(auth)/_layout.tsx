import { selectAuthData, selectIsHydrated, useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const authData = useAuthStore(selectAuthData);
  const isHydrated = useAuthStore(selectIsHydrated);

  if (!isHydrated) {
    return null;
  }

  if (authData) {
    return <Redirect href="/(public)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#fff" }, }} />;
}
