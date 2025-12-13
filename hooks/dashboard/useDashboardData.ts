import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { loadDashboard, type DashboardRequest, type DashboardResponse } from "@/api/api";

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
