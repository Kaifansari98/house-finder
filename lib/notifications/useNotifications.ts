import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  handleNotificationNavigation,
  AppNotificationPayload,
} from "./notifications";

/**
 * Global notification listener hook
 * Use ONCE in RootLayout
 */
export function useNotificationNavigation() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as AppNotificationPayload;

        if (!data?.type) return;

        handleNotificationNavigation(data);
      }
    );

    return () => sub.remove();
  }, []);
}
