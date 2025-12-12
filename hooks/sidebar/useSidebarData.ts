import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { loadSidebar, type SidebarRequest, type SidebarResponse } from "@/api/api";

export const useSidebarData = (
  payload: SidebarRequest | null,
  options?: Omit<UseQueryOptions<SidebarResponse, Error>, "queryKey" | "queryFn">
): UseQueryResult<SidebarResponse, Error> => {
  return useQuery<SidebarResponse, Error>({
    queryKey: ["sidebar", payload?.user_id, payload?.role_id],
    queryFn: () => {
      if (!payload) {
        throw new Error("Missing sidebar payload");
      }
      return loadSidebar(payload);
    },
    enabled: Boolean(payload?.user_id && payload?.role_id),
    ...options,
  });
};
