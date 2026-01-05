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
  const { setToken } = useFcmStore();

  useNotificationNavigation();

  useEffect(() => {
    if (!authData?.encrypted_user_id) return;

    let isMounted = true;

    (async () => {
      const token = await registerForPushNotifications();
      if (!token || !isMounted) return;

      const payload = {
        user_id: authData.encrypted_user_id,
        expo_push_token: token,
        platform: Platform.OS,
        device_id: Device.osInternalBuildId ?? undefined,
        device_model: Device.modelName ?? undefined,
        os_version: Device.osVersion ?? undefined,
        app_version: appVersion,
      };

      saveToken(payload, {
        onSuccess: () => {
          setToken(token, Platform.OS);
        },
      });
    })();

    return () => {
      isMounted = false;
    };
  }, [authData?.encrypted_user_id, saveToken, setToken]);

  return null;
}
