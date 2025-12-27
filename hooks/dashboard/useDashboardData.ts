import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  loadDashboard,
  type DashboardRequest,
  type DashboardResponse,
  acceptLead,
  type AcceptLeadRequest,
  type AcceptLeadResponse,
} from "@/api/api";
import {
  getDashboardLeadStatus,
  getDashboardLeadStatusByAgent,
  GetDashboardLeadStatusRequest,
} from "@/api/dashboard";

export const useDashboardData = (
  payload: DashboardRequest | null,
  options?: Omit<
    UseQueryOptions<DashboardResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<DashboardResponse, Error> => {
  return useQuery<DashboardResponse, Error>({
    queryKey: ["dashboard", payload?.user_id, payload?.role_id],
    queryFn: () => {
      if (!payload) {
        throw new Error("Missing dashboard payload");
      }

      return loadDashboard(payload);
    },
    enabled: Boolean(payload?.user_id && payload?.role_id),
    ...options,
  });
};

export const useAcceptLead = (
  options?: UseMutationOptions<AcceptLeadResponse, Error, AcceptLeadRequest>
): UseMutationResult<AcceptLeadResponse, Error, AcceptLeadRequest> => {
  return useMutation<AcceptLeadResponse, Error, AcceptLeadRequest>({
    mutationKey: ["accept-lead"],
    mutationFn: acceptLead,
    ...options,
  });
};

export const useDashboardLeadStatus = (
  payload?: GetDashboardLeadStatusRequest
) => {
  return useQuery({
    queryKey: ["dashboard-lead-status", payload?.campaign_id ?? "all"],
    queryFn: async () => {
      const res = await getDashboardLeadStatus(payload ?? {});
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};


export const useDashboardLeadStatusByAgent = (
  payload?: {
    campaign_id?: string;
    agent_id?: string;
    agentCampaign_id? : string;
  }
) => {
  return useQuery({
    queryKey: [
      "dashboard-lead-status-agent",
      payload?.campaign_id ?? "all",
      payload?.agent_id ?? "all",
      payload?.agentCampaign_id
    ],
    queryFn: async () => {
      const res = await getDashboardLeadStatusByAgent({
        campaign_id: payload?.campaign_id,
        agent_id: payload?.agent_id,
      });
      return res.data.lead_count;
    },
    enabled: true, // ✅ ALWAYS FETCH (default supported by backend)
    staleTime: 1000 * 60 * 5,
  });
};

