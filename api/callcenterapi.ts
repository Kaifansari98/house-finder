import { apiClient } from "@/utils/apiClient";

export type ViewCallCenterRequest = {
  user_id: string; // encrypted
  followup_startDate?: string;
  followup_endDate?: string;
  filter_agent?: string;
  upload_startDate?: string;
  upload_endDate?: string;
  filter_name?: string;
  filter_mobile?: string;
  filter_mobile2?: string;
  filter_email?: string;
  filter_city?: string;
  filter_location?: string;
  filter_data_name?: string;
  filter_status?: string;
  filter_notes?: string;
  page_no: number;
};

export type CallCenterItem = {
  id: number;
  name: string;
  mobile: string;
  mobile2: string | null;
  email: string | null;
  data_name: string;
  created_at: string;
  created_by: number;
  request_id: string;
  assigned_to: number;
  status: string | null;
  history_type: number;
  followup_date: string | null;
  followup_time: string | null;
  notes: string | null;
  lead_id: number;
  is_lead: string;
  city: string;
  location: string;
  assigned_to_name: string;
};

export type ViewCallCenterResponse = {
  message: string;
  status: number;
  data: {
    data: CallCenterItem[];
  };
};

export const viewCallCenterData = (payload: ViewCallCenterRequest) =>
  apiClient<ViewCallCenterResponse>("view-call-center-data", {
    method: "POST",
    body: payload,
  });

export type GetCallCenterCityResponse = {
  message: string;
  status: number;
  data: {
    city: {
      city: string | null;
    }[];
  };
};

export const getCallCenterCity = () =>
  apiClient<GetCallCenterCityResponse>("get-call-center-city", {
    method: "GET",
  });

export type GetCallCenterLocationResponse = {
  message: string;
  status: number;
  data: {
    location: {
      location: string | null;
    }[];
  };
};

export const getCallCenterLocation = () =>
  apiClient<GetCallCenterLocationResponse>("get-call-center-location", {
    method: "GET",
  });

export type GetCallCenterDataNameResponse = {
  message: string;
  status: number;
  data: {
    location: {
      data_name: string | null;
    }[];
  };
};

export const getCallCenterDataName = () =>
  apiClient<GetCallCenterDataNameResponse>("get-call-center-date-name", {
    method: "GET",
  });


export type GetCallCenterStatusResponse = {
  message: string;
  status: number;
  data: {
    status: string[];
  };
};

export const getCallCenterStatus = () =>
  apiClient<GetCallCenterStatusResponse>("get-call-center-status", {
    method: "GET",
  });



export type CallCenterAgentItem = {
  user_id: number;
  display_name: string;
  status: number;
};

export type GetCallCenterAgentResponse = {
  message: string;
  status: number;
  data: {
    active_agents: CallCenterAgentItem[];
  };
};

export const getCallCenterAgent = () =>
  apiClient<GetCallCenterAgentResponse>("get-call-center-agent", {
    method: "GET",
  });
