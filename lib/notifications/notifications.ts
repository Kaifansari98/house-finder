import * as Notifications from "expo-notifications";
import { router } from "expo-router";

/* =====================================================
   NOTIFICATION TYPES
===================================================== */

export enum NotificationType {
  LEAD_NOTE = "LEAD_NOTE",
}

/* =====================================================
   PAYLOAD TYPES
===================================================== */

export type LeadNoteNotificationPayload = {
  type: NotificationType.LEAD_NOTE;
  leadId: string;
};

export type AppNotificationPayload =
  | LeadNoteNotificationPayload;

/* =====================================================
   LOCAL NOTIFICATION (FRONTEND ONLY)
===================================================== */

export async function triggerLocalLeadNoteNotification(
  leadId: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "New Lead Note Added",
      body: "Tap to view lead notes",
      data: {
        type: NotificationType.LEAD_NOTE,
        leadId,
      } satisfies AppNotificationPayload,
    },
    trigger: null,
  });
}

/* =====================================================
   NOTIFICATION NAVIGATION ROUTER
===================================================== */

export function handleNotificationNavigation(
  payload: AppNotificationPayload
) {
  switch (payload.type) {
    case NotificationType.LEAD_NOTE:
      router.push({
        pathname: "/(public)/view-all-leads",
        params: {
          id: payload.leadId,
          openNotes: "1",
        },
      });
      break;

    default:
      break;
  }
}
