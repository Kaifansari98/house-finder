// screens/Dashboard.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useAuthStore, selectAuthData } from "@/stores/auth-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebarData } from "@/hooks/sidebar/useSidebarData";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import StatsCards from "@/components/StatsCards";
import Activity from "@/components/Activity";
import { DashboardLeadCountItem } from "@/api/dashboard";
import ViewAllEnquiry from "@/components/dashboard/ViewAllEnquiry";
import LeadCountTable from "@/components/dashboard/LeadCountTable";
import LeadStatusCharts from "@/components/dashboard/LeadStatusCharts";
import { useFcmStore } from "@/stores/fcm-store";

export const DUMMY_DASHBOARD_LEAD_COUNT: DashboardLeadCountItem[] = [
  {
    lead_main_status_id: 1,
    lead_main_status_name: "New Lead",
    lead_count: 12,
  },
  {
    lead_main_status_id: 2,
    lead_main_status_name: "Contacting / Interested",
    lead_count: 34,
  },
  {
    lead_main_status_id: 7,
    lead_main_status_name: "Followup / Retry",
    lead_count: 8,
  },
  {
    lead_main_status_id: 5,
    lead_main_status_name: "Lost / Not Interested",
    lead_count: 15,
  },
  {
    lead_main_status_id: 6,
    lead_main_status_name: "Disqualified / Invalid",
    lead_count: 6,
  },
];
export default function Dashboard() {
  const authData = useAuthStore(selectAuthData);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const { data: sidebarData } = useSidebarData(
    authData
      ? {
          user_id: Number(authData.user.user_id),
          role_id: Number(authData.user.role_id),
        }
      : null
  );

  const { data: dashboardData } = useDashboardData(
    authData
      ? {
          user_id: Number(authData.user.user_id),
          role_id: Number(authData.user.role_id),
        }
      : null
  );

  if (!authData) {
    router.push("/(auth)/login");
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Redirecting to login...</Text>
      </View>
    );
  }

  if (!sidebarData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading dashboard...</Text>
      </View>
    );
  }

  const { user, role } = authData;
  const parentMenu = sidebarData.data.parent_menu;
  const childMenu = sidebarData.data.child_menu;

  const handleMenuPress = (item: any) => {
    console.log("Navigate to:", item.page_name, item.href);
    // Add your navigation logic here
  };

  const handleLogout = () => {
    // 1️⃣ Clear auth state
    clearAuth();

    // 2️⃣ Clear FCM token (device-level)
    useFcmStore.getState().clearToken();

    // 3️⃣ Redirect
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.safeArea}
    >
      {/* Navbar */}
      <Navbar
        onMenuPress={() => setSidebarVisible(true)}
        user={user}
        role={role}
      />

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        parentMenu={parentMenu}
        childMenu={childMenu}
        onMenuPress={handleMenuPress}
        onLogout={handleLogout}
      />

      {/* Main Content */}

      <FlatList
        data={[{ id: "dashboard-root" }]} // dummy single item
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Page Title */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>👋🏻 Dashboard</Text>
                <Text style={styles.pageSubtitle}>
                  Welcome back, {user.fullname.split(" ")[0]}.
                </Text>
              </View>
            </View>

            <View style={styles.statsCardsContainer}>
              <StatsCards
                totalLeads={dashboardData.data.total_leads}
                missedFollowup={dashboardData.data.missed_followup}
                todayFollowup={dashboardData.data.today_followup}
                futureFollowup={dashboardData.data.future_followup}
              />
            </View>

            <View style={styles.ActivityContainer}>
              <Activity logs={dashboardData.data.lead_assignment_log} />
            </View>

            <View style={styles.statsCardsContainer}>
              <LeadStatusCharts />
            </View>

            <View style={styles.statsCardsContainer}>
              <ViewAllEnquiry />
            </View>

            <View style={styles.statsCardsContainer}>
              <LeadCountTable />
            </View>

            {/* User Profile Card */}
            {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>User Profile</Text>
          <View style={styles.cardContent}>
            {[
              { label: "Vendor ID", value: user.vendor_id },
              { label: "User ID", value: user.user_id },
              { label: "Employee ID", value: user.employee_id || "—"},
              { label: "Company ID", value: user.company_id },
              { label: "Department ID", value: user.department_id || "—"},
              { label: "Role ID", value: user.role_id },
              { label: "Full Name", value: user.fullname },
              { label: "Display Name", value: user.display_name },
            ].map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.infoRow,
                  index === 7 && styles.lastInfoRow, // no border on last item
                ]}
              >
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View> */}

            {/* Role Information Card */}
            {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>Role Information</Text>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role Name</Text>
              <Text style={styles.infoValue}>{role.role_name}</Text>
            </View>
            <View style={[styles.infoRow, styles.lastInfoRow]}>
              <Text style={styles.infoLabel}>Role Master ID</Text>
              <Text style={styles.infoValue}>{role.role_master_id}</Text>
            </View>
          </View>
        </View> */}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingVertical: 15,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  statsCardsContainer: {
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  ActivityContainer: {
    marginBottom: 4,
    // marginLeft: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 17,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
