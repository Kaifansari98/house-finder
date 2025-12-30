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
