// hooks/fcm/useSaveFcmToken.ts
import {
  saveFcmToken,
  SaveFcmTokenRequest,
  SaveFcmTokenResponse,
  sendAppNotification,
  SendAppNotificationRequest,
  SendAppNotificationResponse,
} from "@/api/notification";
import { useMutation } from "@tanstack/react-query";

export const useSaveFcmToken = () => {
  return useMutation<SaveFcmTokenResponse, Error, SaveFcmTokenRequest>({
    mutationFn: saveFcmToken,
    onSuccess: (data, variables) => {
      console.log("✅ FCM Token saved successfully");
      console.log("📤 Sent payload:", variables);
      console.log("📥 Server response:", data);
    },

    onError: (error, variables) => {
      console.error("❌ Failed to save FCM token");
      console.error("📤 Payload:", variables);
      console.error("🔥 Error:", error);
    },
  });
};


export const useSendAppNotification = () => {
  return useMutation<
    SendAppNotificationResponse,
    Error,
    SendAppNotificationRequest
  >({
    mutationFn: sendAppNotification,
  });
};