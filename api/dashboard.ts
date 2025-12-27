import { apiClient } from "@/utils/apiClient";

// Lead status for campaign
export type DashboardLeadCountItem = {
  lead_count: number;
  lead_main_status_name: string;
  lead_main_status_id: number;
};

export type DashboardAgentItem = {
  user_id: number;
  display_name: string;
};

export type GetDashboardLeadStatusRequest = {
  campaign_id?: string;
};

export type GetDashboardLeadStatusResponse = {
  message: string;
  status: number;
  data: {
    lead_count: DashboardLeadCountItem[];
    agent_list: DashboardAgentItem[];
  };
};

export const getDashboardLeadStatus = (
  payload: GetDashboardLeadStatusRequest
) =>
  apiClient<GetDashboardLeadStatusResponse>("get-dashboard-lead-status", {
    method: "POST",
    body: payload,
  });

// lead status for agent
export type GetDashboardLeadStatusAgentRequest = {
  agent_id?: string;
  campaign_id?: string;
};
export type GetDashboardLeadStatusAgentResponse = {
  message: string;
  status: number;
  data: {
    lead_count: DashboardLeadCountItem[];
  };
};

export const getDashboardLeadStatusByAgent = (
  payload: GetDashboardLeadStatusAgentRequest
) =>
  apiClient<GetDashboardLeadStatusAgentResponse>(
    "get-dashboard-lead-status-agent",
    {
      method: "POST",
      body: payload,
    }
  );



  // api/dashboard.api.ts

export type CampaignForReportItem = {
  campaign_id: number;
  campaign_name: string;
  campaign_type: number;
  rstatus: number;
  start_date: string;
  end_date: string;
  form_name: string | null;
  broucher: string | null;
};

export type GetCampaignForReportAgentRequest = {
  user_id: string; // encrypted user id
};

export type GetCampaignForReportAgentResponse = {
  message: string;
  status: number;
  data: {
    campaigns: CampaignForReportItem[];
  };
};

export const getCampaignForReportAgent = (
  payload: GetCampaignForReportAgentRequest
) =>
  apiClient<GetCampaignForReportAgentResponse>(
    "get-campaign-for-report-agent",
    {
      method: "GET",
      query: {
        user_id: payload.user_id,
      },
    }
  );


  