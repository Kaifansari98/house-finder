import { StyleSheet, View } from "react-native";
import React from "react";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { Users, TrendingUp } from "lucide-react-native";
import DynamicTable from "./Table";

const LeadCountTable = () => {
  const authData = useAuthStore(selectAuthData);

  const { data: dashboardData } = useDashboardData(
    authData
      ? {
          user_id: Number(authData.user.user_id),
          role_id: Number(authData.user.role_id),
        }
      : null
  );

  const allLeadCount = dashboardData?.data?.all_lead_count || [];
  const callCenterRawDataCount =
    dashboardData?.data?.call_center_raw_data_count || [];

  // const todaysleads = dashboardData?.data.today_followupz

  // Calculate totals
  const allLeadTotal = allLeadCount.reduce(
    (sum, item) => sum + item.lead_count,
    0
  );
  const callCenterTotal = callCenterRawDataCount.reduce(
    (sum, item) => sum + item.lead_count,
    0
  );

  // Define columns for tables
  const leadColumns = [
    {
      key: "agent_fullname",
      title: "Agent Name",
      flex: 2,
      align: "left" as const,
      render: (value: any) => value || "Unknown",
    },
    {
      key: "lead_count",
      title: "Lead Count",
      flex: 1,
      align: "right" as const,
    },
  ];

  return (
    <View style={styles.container}>
      {/* All Lead Count Table */}
      <DynamicTable
        title="All Lead Count"
        data={allLeadCount}
        columns={leadColumns}
        searchKey="agent_fullname"
        summaryStats={[
          {
            icon: <Users size={18} color="#0f172a" strokeWidth={2.5} />,
            label: "Agents",
            value: allLeadCount.length,
          },
          {
            icon: <TrendingUp size={18} color="#0f172a" strokeWidth={2.5} />,
            label: "Total Count",
            value: allLeadTotal.toLocaleString(),
          },
        ]}
      />

      {/* Call Center Raw Data Count Table */}
      <DynamicTable
        title="Call Center Raw Data Count"
        data={callCenterRawDataCount}
        columns={leadColumns}
        searchKey="agent_fullname"
        summaryStats={[
          {
            icon: <Users size={18} color="#0f172a" strokeWidth={2.5} />,
            label: "Agents",
            value: callCenterRawDataCount.length,
          },
          {
            icon: <TrendingUp size={18} color="#0f172a" strokeWidth={2.5} />,
            label: "Total Count",
            value: callCenterTotal.toLocaleString(),
          },
        ]}
      />
    </View>
  );
};

export default LeadCountTable;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 20,
  },
});
