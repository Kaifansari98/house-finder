import { viewCallCenterData, ViewCallCenterRequest } from "@/api/callcenterapi";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useInfiniteCallCenterData = (
  payload: ViewCallCenterRequest | null
) => {
  return useInfiniteQuery({
    queryKey: [
      "call-center-data-infinite",
      payload ? JSON.stringify(payload) : null,
    ],

    queryFn: ({ pageParam }) => {
      if (!payload) throw new Error("Missing payload");

      return viewCallCenterData({
        ...payload,
        page_no: pageParam ?? 1,
      });
    },

    enabled: Boolean(payload?.user_id),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      const lastPageCount = lastPage.data?.data?.length ?? 0;

      // If backend returns empty array → stop pagination
      if (lastPageCount === 0) return undefined;

      return allPages.length + 1;
    },

    staleTime: 1000 * 60 * 5,
  });
};
