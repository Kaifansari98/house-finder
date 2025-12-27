import { StyleSheet, Text, View } from "react-native";
import React, { useMemo, useState } from "react";
import CampaignSelector from "../campaignSelector";
import LeadsPieChart from "../charts/piechart";
import {
  useCampaignForReportAgent,
  useMastersData,
} from "@/hooks/sidebar/masters/useMastersData";
import {
  useDashboardLeadStatus,
  useDashboardLeadStatusByAgent,
} from "@/hooks/dashboard/useDashboardData";
import { useRouter } from "expo-router";
import { selectAuthData, useAuthStore } from "@/stores/auth-store";

/* ===================== DEFAULT DATA ===================== */

const LeadStatusCharts = () => {
  const router = useRouter();
  const authData = useAuthStore(selectAuthData);
  const userId = authData?.encrypted_user_id;
  const role_id = authData?.role.role_master_id;

  const isAdmin = role_id === 1;
  console.log("role id: ", role_id);
  console.log("userId: ", userId);

  const [selectedCampaign, setSelectedCampaign] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const [selectedAgent, setSelectedAgent] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const [selectedAgentCampaign, setSelectedAgentCampaign] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const { leadCampaignQuery } = useMastersData();

  /* ===================== CAMPAIGN DATA ===================== */

  const dashboardLeadStatusQuery = useDashboardLeadStatus(
    selectedCampaign ? { campaign_id: selectedCampaign.value } : {} // ALL campaigns
  );
  const campaignLeadCount = useMemo(
    () => dashboardLeadStatusQuery.data?.lead_count ?? [],
    [dashboardLeadStatusQuery.data]
  );

  const dashboardLeadStatusByAgentQuery = useDashboardLeadStatusByAgent({
    campaign_id: selectedCampaign?.value,
    agent_id: selectedAgent?.value,
  });

  const agentLeadCount = useMemo(
    () => dashboardLeadStatusByAgentQuery.data ?? [],
    [dashboardLeadStatusByAgentQuery.data]
  );

  const campaignForAgentReportQuery = useCampaignForReportAgent({
    user_id: userId!,
  });
  /* ===================== Agent Self ===================== */

  const selfAgentQuery = useDashboardLeadStatusByAgent({
    campaign_id: selectedAgentCampaign?.value,
    agent_id: userId, // 🔥 IMPORTANT
  });

  const selfAgentLeadCount = useMemo(
    () => selfAgentQuery.data ?? [],
    [selfAgentQuery.data]
  );

  /* ===================== CAMPAIGN SELECT OPTIONS ===================== */

  const map = (arr: any[] | undefined, l: string, v: string) =>
    arr?.map((i) => ({ label: String(i[l]), value: String(i[v]) })) ?? [];

  const campaigns = useMemo(
    () =>
      map(
        leadCampaignQuery.data?.data.lead_campaign,
        "campaign_name",
        "campaign_id"
      ),
    [leadCampaignQuery.data]
  );

  const agentsCampaign = useMemo(
    () =>
      map(
        campaignForAgentReportQuery.data?.data.campaigns,
        "campaign_name",
        "campaign_id"
      ),
    [campaignForAgentReportQuery.data]
  );

  /* ===================== AGENT LIST (FROM CAMPAIGN API) ===================== */

  const agentOptions = useMemo(() => {
    if (!selectedCampaign) return [];

    return (
      dashboardLeadStatusQuery.data?.agent_list?.map((agent) => ({
        label: agent.display_name,
        value: String(agent.user_id),
      })) ?? []
    );
  }, [selectedCampaign, dashboardLeadStatusQuery.data]);

  /* ===================== AGENT-LEVEL DATA ===================== */

  /* ===================== HANDLERS ===================== */

  const handleStatusPress = (statusId: number, statusName: string) => {
    router.push({
      pathname: "/(public)/view-all-leads",
      params: {
        lead_main_status_id: String(statusId),

        // optional context (future ready)
        campaign_id: selectedCampaign?.value,
        agent_id: selectedAgent?.value,
      },
    });
  };

  /* ===================== UI ===================== */

  return (
    <View style={styles.container}>
      {/* ===================== ADMIN ONLY ===================== */}
      {isAdmin ? (
        <>
          {/* Campaign Chart */}
          <View style={styles.chartHeader}>
            <Text style={styles.title}>Lead Status (Campaign)</Text>
            <CampaignSelector
              campaigns={campaigns}
              selectedCampaign={selectedCampaign}
              onSelect={setSelectedCampaign}
              title="Select Campaign"
              placeholder="All Campaigns"
            />
          </View>

          <LeadsPieChart
            leadData={campaignLeadCount}
            loading={dashboardLeadStatusQuery.isLoading}
            onStatusPress={handleStatusPress}
          />

          {/* Agent Selector Chart */}
          <View style={[styles.chartHeader, { marginTop: 24 }]}>
            <Text style={styles.title}>Lead Status (Agent)</Text>
            <CampaignSelector
              campaigns={agentOptions}
              selectedCampaign={selectedAgent}
              onSelect={setSelectedAgent}
              title="Select Agent"
              placeholder="All Agents"
            />
          </View>

          <LeadsPieChart
            leadData={agentLeadCount}
            loading={dashboardLeadStatusByAgentQuery.isLoading}
            onStatusPress={handleStatusPress}
          />
        </>
      ) : (
        <>
          <View style={[styles.chartHeader]}>
            <Text style={styles.title}>Lead Status</Text>
            <CampaignSelector
              campaigns={agentsCampaign}
              selectedCampaign={selectedAgentCampaign}
              onSelect={setSelectedAgentCampaign}
              title="Select Campaign"
              placeholder="All Campaign"
            />
          </View>

          <LeadsPieChart
            leadData={selfAgentLeadCount}
            loading={selfAgentQuery.isLoading}
            onStatusPress={handleStatusPress}
          />
        </>
      )}
    </View>
  );
};

export default LeadStatusCharts;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
});
