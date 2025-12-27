import { useQuery } from "@tanstack/react-query";
import {
  loadCategories,
  loadPropertyTypes,
  loadLeadTypes,
  loadCities,
  loadLeadStatuses,
  loadLeadMainStatuses,
  loadLeadSources,
  loadLeadChannels,
  loadLeadCampaigns,
  loadLeadAgents,
  loadLeadSanity,
  type CategoryResponse,
  type PropertyTypeResponse,
  type LeadTypeResponse,
  type CitiesResponse,
  type LeadStatusResponse,
  type LeadMainStatusesResponse,
  type LeadSourceResponse,
  type LeadChannelResponse,
  type LeadCampaignResponse,
  type LeadAgentsResponse,
  type LeadSanityResponse,
  LeadActivityTypeResponse,
  loadLeadActivityTypes,
} from "@/api/api";
import {
  getCampaignForReportAgent,
  GetCampaignForReportAgentRequest,
  GetCampaignForReportAgentResponse,
} from "@/api/dashboard";

export const useMastersData = () => {
  const categoryQuery = useQuery<CategoryResponse, Error>({
    queryKey: ["masters", "categories"],
    queryFn: loadCategories,
  });
  const propertyTypeQuery = useQuery<PropertyTypeResponse, Error>({
    queryKey: ["masters", "property-types"],
    queryFn: loadPropertyTypes,
  });
  const leadTypeQuery = useQuery<LeadTypeResponse, Error>({
    queryKey: ["masters", "lead-types"],
    queryFn: loadLeadTypes,
  });
  const citiesQuery = useQuery<CitiesResponse, Error>({
    queryKey: ["masters", "cities"],
    queryFn: loadCities,
  });
  const leadStatusQuery = useQuery<LeadStatusResponse, Error>({
    queryKey: ["masters", "lead-status"],
    queryFn: loadLeadStatuses,
  });
  const leadMainStatusQuery = useQuery<LeadMainStatusesResponse, Error>({
    queryKey: ["masters", "lead-main-statuses"],
    queryFn: loadLeadMainStatuses,
  });
  const leadSourceQuery = useQuery<LeadSourceResponse, Error>({
    queryKey: ["masters", "lead-sources"],
    queryFn: loadLeadSources,
  });
  const leadChannelQuery = useQuery<LeadChannelResponse, Error>({
    queryKey: ["masters", "lead-channels"],
    queryFn: loadLeadChannels,
  });
  const leadCampaignQuery = useQuery<LeadCampaignResponse, Error>({
    queryKey: ["masters", "lead-campaigns"],
    queryFn: loadLeadCampaigns,
  });

  const leadSanityQuery = useQuery<LeadSanityResponse, Error>({
    queryKey: ["masters", "lead-sanity"],
    queryFn: loadLeadSanity,
  });

  const leadActivityTypeQuery = useQuery<LeadActivityTypeResponse, Error>({
    queryKey: ["masters", "lead-activity-types"],
    queryFn: loadLeadActivityTypes,
    staleTime: 10 * 60 * 1000,
  });

  return {
    categoryQuery,
    propertyTypeQuery,
    leadTypeQuery,
    citiesQuery,
    leadStatusQuery,
    leadMainStatusQuery,
    leadSourceQuery,
    leadChannelQuery,
    leadCampaignQuery,
    leadSanityQuery,
    leadActivityTypeQuery,
  };
};

export const useLeadAgents = (userId?: number) => {
  return useQuery<LeadAgentsResponse, Error>({
    queryKey: ["masters", "lead-agents", userId],
    queryFn: () => loadLeadAgents(userId as number),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCampaignForReportAgent = (
  payload?: GetCampaignForReportAgentRequest
) => {
  return useQuery<GetCampaignForReportAgentResponse, Error>({
    queryKey: ["campaign-for-report-agent", payload?.user_id],
    queryFn: () =>
      getCampaignForReportAgent(payload as GetCampaignForReportAgentRequest),
    enabled: !!payload?.user_id,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
};
