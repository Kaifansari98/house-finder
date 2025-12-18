import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import type { DashboardLeadAssignmentLog } from "@/api/api";
import { useAcceptLead } from "@/hooks/dashboard/useDashboardData";
import { useAuthStore, selectAuthData } from "@/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "./Toast";

type ActivityProps = {
  logs?: DashboardLeadAssignmentLog[];
};

const formatDateTime = (datetime: string) => {
  if (!datetime) return "";
  const [datePart, timePart] = datetime.split(" ");
  if (!datePart || !timePart) return datetime;

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  const shortYear = year?.slice(-1) ?? ""; // Just last single digit
  const MONTHS = [
    "",
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  let monthNum = Number(month);
  let monthStr =
    monthNum && monthNum >= 1 && monthNum <= 12
      ? MONTHS[monthNum]
      : month ?? "--";

  return `${hour ?? "--"}:${minute ?? "--"}, ${
    day ?? "--"
  }-${monthStr}-${shortYear}`;
};

const formatCountdown = (seconds: number) => {
  const clamped = Math.max(0, seconds);
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;

  const pad = (val: number) => String(val).padStart(2, "0");
  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
};

export default function Activity({ logs }: ActivityProps) {
  const authData = useAuthStore(selectAuthData);
  const queryClient = useQueryClient();
  const { mutate: acceptLeadMutation, isPending } = useAcceptLead({
    onSuccess: () => {
      setConfirmVisible(false);
      setSelectedLog(null);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.refetchQueries({ queryKey: ["dashboard"], type: "active" });
      setToast({
        visible: true,
        type: "success",
        text: "Lead assigned to you.",
      });
      toastTimerRef.current && clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2500);
    },
    onError: (err) => {
      console.error("Accept lead failed", err);
      setConfirmVisible(false);
      setSelectedLog(null);
      setToast({
        visible: true,
        type: "error",
        text: "Failed to accept lead.",
      });
      toastTimerRef.current && clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2500);
    },
  });

  const [timers, setTimers] = useState<Record<number, number>>({});
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedLog, setSelectedLog] =
    useState<DashboardLeadAssignmentLog | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    text: string;
  }>({
    visible: false,
    type: "info",
    text: "",
  });
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const initialTimers = useMemo(() => {
    const next: Record<number, number> = {};
    logs?.forEach((log) => {
      next[log.id] = Math.max(0, Math.round((log.time_diff || 0) * 60));
    });
    return next;
  }, [logs]);

  useEffect(() => {
    setTimers(initialTimers);
  }, [initialTimers]);

  useEffect(() => {
    if (!logs || logs.length === 0) return;
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next: Record<number, number> = {};
        let changed = false;
        Object.entries(prev).forEach(([id, value]) => {
          const numericId = Number(id);
          const nextValue = value > 0 ? value - 1 : 0;
          next[numericId] = nextValue;
          if (nextValue !== value) changed = true;
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logs]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  if (!logs || logs.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{logs.length}</Text>
            </View>
            <Text style={styles.title}>Leads Assignment Activity</Text>
          </View>
          <Text style={styles.subtitle}>
            Leads are only available for two hours — act fast.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {logs.map((log) => {
          const initials = (log.fullname || "NA")
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
            .slice(0, 2);

          return (
            <View key={log.id} style={styles.tile}>
              <View style={styles.tileTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.tileInfo}>
                  <Text style={styles.name}>{log.fullname}</Text>
                  {log.email ? (
                    <View style={styles.inline}>
                      <Text style={styles.email}>{log.email}</Text>
                    </View>
                  ) : (
                    <Text style={styles.email}>No email</Text>
                  )}
                </View>
              </View>

              <View style={styles.metaBlock}>
                <View style={styles.metaHeaderRow}>
                  <Text style={styles.metaLabel}>Assigned At</Text>
                  <Text style={styles.metaLabel}>Ends At</Text>
                </View>
                <View style={styles.metaValueRow}>
                  <Text style={styles.metaValue}>
                    {formatDateTime(log.created_at)}
                  </Text>
                  <Text style={styles.metaValue}>
                    {formatDateTime(log.end_time)}
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.timerLabel}>Time remaining</Text>
                  <Text style={styles.timer}>
                    {formatCountdown(
                      timers[log.id] !== undefined
                        ? timers[log.id]
                        : Math.round((log.time_diff || 0) * 60)
                    )}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cta}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedLog(log);
                    console.log("Accept modal opened", {
                      lead_id: log.lead_id,
                      user_id: authData?.encrypted_user_id,
                    });
                    setConfirmVisible(true);
                  }}
                >
                  <Text style={styles.ctaText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Toast visible={toast.visible} type={toast.type} text={toast.text} />

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Accept lead?</Text>
            <Text style={styles.modalSubtitle}>
              This Lead {selectedLog?.fullname ?? "This lead"} will be assigned
              to you. Are your sure to accept this Lead?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setConfirmVisible(false)}
                disabled={isPending}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={() => {
                  if (!selectedLog || !authData?.encrypted_user_id) {
                    setConfirmVisible(false);
                    return;
                  }
                  acceptLeadMutation({
                    lead_id: selectedLog.lead_id,
                    user_id: authData.encrypted_user_id,
                  });
                }}
                disabled={isPending}
              >
                <Text style={styles.modalConfirmText}>
                  {isPending ? "Accepting..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginTop: 10,
  },
  header: {
    marginBottom: 14,
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    marginHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "300",
  },
  badge: {
    alignItems: "center",
  },
  badgeText: {
    color: "#0b1220",
    fontWeight: "700",
    fontSize: 16,
  },
  horizontalList: {
    gap: 12,
    marginLeft: 20,
    marginRight: 40,
  },
  tile: {
    width: 280,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  tileTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: "#EFBF04",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "800",
    color: "#fff",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  email: {
    color: "#000",
    fontSize: 13,
    fontWeight: "300",
  },
  tileInfo: { flex: 1 },
  metaBlock: {
    backgroundColor: "#efeff0",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  metaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  metaValue: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  timerLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  timer: {
    color: "#000",
    fontWeight: "800",
    fontSize: 16,
  },
  cta: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  modalTitle: {
    color: "#000",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  modalSubtitle: {
    color: "#333",
    fontSize: 14,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancel: {
    borderColor: "#1f2937",
    backgroundColor: "#0f172a",
  },
  modalConfirm: {
    borderColor: "#EFBF04",
    backgroundColor: "#EFBF04",
  },
  modalCancelText: {
    color: "#e5e7eb",
    fontWeight: "700",
  },
  modalConfirmText: {
    color: "#fff",
    fontWeight: "800",
  },
});
