import { useQuery, type UseQueryOptions, type UseQueryResult, useMutation, type UseMutationOptions, type UseMutationResult  } from "@tanstack/react-query";
import {
  loadDashboard,
  type DashboardRequest,
  type DashboardResponse,
  acceptLead,
  type AcceptLeadRequest,
  type AcceptLeadResponse,
} from "@/api/api";

export const useDashboardData = (
  payload: DashboardRequest | null,
  options?: Omit<UseQueryOptions<DashboardResponse, Error>, "queryKey" | "queryFn">
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
