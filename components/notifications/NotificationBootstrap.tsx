import { useEffect } from "react";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import { registerForPushNotifications } from "@/lib/notifications/registerPushToken";
import { useNotificationNavigation } from "@/lib/notifications/useNotifications";
import { useFcmStore } from "@/stores/fcm-store";
import { useSaveFcmToken } from "@/hooks/notifications/useNotification";

const appVersion = Constants.expoConfig?.version ?? "unknown";

export default function NotificationBootstrap() {
  const { mutate: saveToken } = useSaveFcmToken();
  const authData = useAuthStore(selectAuthData);

  const { token: savedToken, setToken } = useFcmStore();

  useNotificationNavigation();

  useEffect(() => {
    if (!authData?.encrypted_user_id) return;

    registerForPushNotifications().then((newToken) => {
      if (!newToken) return;

      // 🔒 SAME TOKEN → SKIP API CALL
      if (savedToken === newToken) {
        console.log("FCM token unchanged. Skipping API call.");
        return;
      }

      console.log("New FCM token detected. Syncing...");

      saveToken(
        {
          user_id: authData.encrypted_user_id,
          expo_push_token: newToken,
          platform: Platform.OS,
          device_id: Device.osInternalBuildId ?? undefined,
          device_model: Device.modelName ?? undefined,
          os_version: Device.osVersion ?? undefined,
          app_version: appVersion,
        },
        {
          onSuccess: () => {
            // ✅ Save locally ONLY after backend success
            setToken(newToken, Platform.OS);
          },
        }
      );
    });
  }, [authData?.encrypted_user_id, savedToken, saveToken, setToken]);

  return null;
}
