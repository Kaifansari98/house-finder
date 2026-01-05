// api/fcm.api.ts
import { apiClient } from "@/utils/apiClient";

/* ================= TYPES ================= */

export type SaveFcmTokenRequest = {
  user_id: string;
  expo_push_token: string;
  platform: string;
  device_id?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
};

export type SaveFcmTokenResponse = {
  message: string;
  status: number;
  data: null;
};

/* ================= API FUNCTION ================= */

export const saveFcmToken = (payload: SaveFcmTokenRequest) =>
  apiClient<SaveFcmTokenResponse>("save-fcm-token-app", {
    method: "POST",
    body: payload,
  });

/* ================= TYPES ================= */

export type SendAppNotificationRequest = {
  user_id: string; // encrypted user id
};

export type SendAppNotificationResponse = {
  message: string;
  status: number;
};

/* ================= API FUNCTION ================= */

export const sendAppNotification = (payload: SendAppNotificationRequest) =>
  apiClient<SendAppNotificationResponse>("send-app-notifcation", {
    method: "POST",
    body: payload,
  });
