import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Calendar,
  Trash2,
  Clock,
  CheckCircle2,
  CalendarFoldIcon,
} from "lucide-react-native";

import ScreenNavbar from "@/components/ScreenNavbar";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";

import type { MyTaskItem } from "@/api/taskapi";
import { useTeamTask } from "@/hooks/task/useTask";
import { formatDateWithTime } from "@/utils/utils";
import { useLeadAgents } from "@/hooks/sidebar/masters/useMastersData";
import SelectField from "@/modals/SmartDropDown";

/* ================= UTILS ================= */

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const formatDisplayDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-GB", options);
};

/* ================= COMPONENT ================= */

const TeamTasks = () => {
  const authData = useAuthStore(selectAuthData);
  const user_id_enc = authData?.encrypted_user_id;
  const userId = authData?.user.user_id;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [showPicker, setShowPicker] = useState(false);

  const formattedDate = formatDate(selectedDate);

  // Team Task Query with agent_id filter
  const { data, isLoading, isError, refetch } = useTeamTask({
    user_id: user_id_enc!,
    date: formattedDate,
    agent_id: selectedAgent || undefined, // Only pass if selected
  });

  const { data: agentsData, isLoading: agentsLoading } = useLeadAgents(userId);

  const map = (arr: any[] | undefined, l: string, v: string) =>
    arr?.map((i) => ({ label: String(i[l]), value: String(i[v]) })) ?? [];

  const tasks = data ?? [];

  const handleDelete = (taskId: number) => {
    console.log("Delete task:", taskId);
    // Add your delete logic here
  };

  const agents = useMemo(
    () => map(agentsData?.data?.lead_agents, "display_name", "user_id"),
    [agentsData]
  );

  React.useEffect(() => {
    if (!selectedAgent && agents.length > 0) {
      setSelectedAgent("1"); // fallback default
    }
  }, [agents]);

  const shouldShowAgentDropdown =
    agents.length > 0 && agents.some((a) => a.value === selectedAgent);

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: MyTaskItem }) => {
    return (
      <View style={styles.taskCard}>
        {/* Task Description Section */}
        <View style={styles.taskContent}>
          <CheckCircle2 size={20} color="#EFBF04" strokeWidth={2.5} />

          <View style={styles.taskTextContainer}>
            <Text style={styles.taskTitle} numberOfLines={3}>
              {item.task_description}
            </Text>
          </View>
        </View>

        {/* Meta Row - Time, Status and Delete */}
        <View style={styles.metaRow}>
          <View style={styles.leftMeta}>
            <View style={styles.timeContainer}>
              <Clock size={15} color="#9ca3af" strokeWidth={2} />
              <Text style={styles.timeText}>{item.task_time} min</Text>
            </View>

            <View style={[styles.timeContainer]}>
              <CalendarFoldIcon size={15} color="#9ca3af" strokeWidth={2} />
              <Text style={[styles.statusText]}>
                {formatDateWithTime(item.created_at)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.7}
            onPress={() => handleDelete(item.id)}
          >
            <Trash2 size={16} color="#ef4444" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ================= EMPTY ================= */

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconContainer}>
        <Calendar size={56} color="#9ca3af" strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No Tasks Found</Text>
      <Text style={styles.emptyText}>
        {selectedAgent
          ? "No tasks found for the selected agent."
          : "There are no tasks scheduled for this date."}
      </Text>
    </View>
  );

  /* ================= UI ================= */

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScreenNavbar title="Team Tasks" />

      {/* DATE PICKER & AGENT FILTER */}
      <View style={styles.inputContainer}>
        {/* DATE */}
        <View style={styles.dateContainer}>
          <Text style={styles.inputLabel}>Filter by date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={18} color="#0f172a" strokeWidth={2} />
            <Text style={styles.dateText}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AGENT SELECT */}
        {shouldShowAgentDropdown && (
          <SelectField
            label="Filter by Agent"
            options={agents}
            loading={agentsLoading}
            disabled={!userId}
            value={selectedAgent}
            onChange={(val) => {
              setSelectedAgent(val ?? "");
            }}
          />
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          onChange={(_, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* CONTENT */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#EFBF04" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load tasks</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContainer,
            tasks.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default TeamTasks;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  inputContainer: {
    padding: 10,
    gap: 5,
  },

  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },

  listContainer: {
    padding: 10,
  },

  dateContainer: {
    width: "100%",
  },

  taskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 5,
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  taskContent: {
    flexDirection: "row",
    gap: 12,
  },

  taskTextContainer: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  errorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dc2626",
  },

  retryBtn: {
    backgroundColor: "#EFBF04",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
