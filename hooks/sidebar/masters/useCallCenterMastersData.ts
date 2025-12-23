import {
  getCallCenterAgent,
  GetCallCenterAgentResponse,
  getCallCenterCity,
  GetCallCenterCityResponse,
  getCallCenterDataName,
  GetCallCenterDataNameResponse,
  getCallCenterLocation,
  GetCallCenterLocationResponse,
  getCallCenterStatus,
  GetCallCenterStatusResponse,
} from "@/api/callcenterapi";
import { useQuery } from "@tanstack/react-query";

export const useCallCenterMasterData = () => {
  const citiesQuery = useQuery<GetCallCenterCityResponse, Error>({
    queryKey: ["masters", "call-center-cities"],
    queryFn: getCallCenterCity,
  });

  const locationQuery = useQuery<GetCallCenterLocationResponse, Error>({
    queryKey: ["masters", "call-center-locations"],
    queryFn: getCallCenterLocation,
  });

  const datanameQuery = useQuery<GetCallCenterDataNameResponse, Error>({
    queryKey: ["masters", "call-center-dataname"],
    queryFn: getCallCenterDataName,
  });

  const statusQuery = useQuery<GetCallCenterStatusResponse, Error>({
    queryKey: ["masters", "call-center-status"],
    queryFn: getCallCenterStatus,
  });

  const agentQuery = useQuery<GetCallCenterAgentResponse, Error>({
    queryKey: ["masters", "call-center-agent"],
    queryFn: getCallCenterAgent,
  });

  return {
    citiesQuery,
    locationQuery,
    datanameQuery,
    statusQuery,
    agentQuery,
  };
};
