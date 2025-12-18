import {
  useMutation,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  UseInfiniteQueryResult,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import {
  filterLeadApp,
  type FilterLeadAppRequest,
  type FilterLeadAppResponse,
  saveLead,
  type SaveLeadRequest,
  type SaveLeadResponse,
} from "@/api/api";

export const useLeadsApi = (
  options?: UseMutationOptions<SaveLeadResponse, Error, SaveLeadRequest>
): UseMutationResult<SaveLeadResponse, Error, SaveLeadRequest> =>
  useMutation<SaveLeadResponse, Error, SaveLeadRequest>({
    mutationKey: ["save-lead"],
    mutationFn: saveLead,
    ...options,
  });

export const useFilterLeadApp = (
  payload: FilterLeadAppRequest | null,
  options?: Omit<
    UseQueryOptions<FilterLeadAppResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<FilterLeadAppResponse, Error> => {
  return useQuery<FilterLeadAppResponse, Error>({
    queryKey: ["filter-lead-app", payload],
    queryFn: () => {
      if (!payload) throw new Error("Missing filter payload");
      return filterLeadApp(payload);
    },
    enabled: Boolean(
      payload?.user_id &&
        payload?.page_no !== undefined &&
        payload?.limit !== undefined
    ),
    ...options,
  });
};

type InfiniteLeadsPayload = Omit<FilterLeadAppRequest, "page_no" | "limit"> & {
  limit: string | number;
};

export const useInfiniteFilterLeadApp = (
  payload: InfiniteLeadsPayload | null
): UseInfiniteQueryResult<
  InfiniteData<FilterLeadAppResponse>,
  Error
> => {
  return useInfiniteQuery<
    FilterLeadAppResponse,
    Error
  >({
    queryKey: ["filter-lead-app-infinite", payload],
    queryFn: ({ pageParam }) => {
      if (!payload) throw new Error("Missing filter payload");

      return filterLeadApp({
        ...payload,
        page_no: String(pageParam ?? 0),
        limit: payload.limit,
      });
    },
    enabled: Boolean(payload?.user_id && payload?.limit !== undefined),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + (page.data?.data?.length ?? 0),
        0
      );

      const total =
        lastPage.data?.recordsFiltered ??
        lastPage.data?.recordsTotal ??
        0;

      if (loadedCount >= total) return undefined;
      return allPages.length; // 0,1,2...
    },
  });
};