import { apiClient } from "@/utils/apiClient";

export type LoginRequest = {
  username: string;
  password: string;
  device: string;
  version: string;
};

export type LoginResponse = {
  message: string;
  status: number;
  data: {
    user: {
      vendor_id: number;
      user_id: number;
      employee_id: number;
      company_id: number;
      department_id: number;
      role_id: number;
      fullname: string;
      display_name: string;
    };
    role: {
      role_name: string;
      role_master_id: number;
    };
    encrypted_user_id: string;
  };
};

export const login = (payload: LoginRequest) =>
  apiClient<LoginResponse>("app-login", {
    method: "POST",
    body: payload,
  });

// Sidebar menu
export type SidebarRequest = {
  user_id: number;
  role_id: number;
};

export type SidebarMenuItem = {
  id: number;
  page_name: string;
  parent_id: number;
  created_by: number | null;
  href: string | null;
  main_menu_id: string | null;
  svg: string | null;
  sub_menu_id: number | null;
};

export type SidebarResponse = {
  message: string;
  status: number;
  data: {
    parent_menu: SidebarMenuItem[];
    child_menu: SidebarMenuItem[];
  };
};

export const loadSidebar = (payload: SidebarRequest) =>
  apiClient<SidebarResponse>("app-load-menu", {
    method: "POST",
    body: payload,
  });

// Dashboard
export type DashboardRequest = {
  user_id: number;
  role_id: number;
};

export type DashboardLeadCount = {
  total_lead: number;
  title: string;
};

export type DashboardActivityReport = {
  total_history: number;
  distinct_history: number;
  fullname: string;
};

export type DashboardCampaignDetail = {
  total_lead: number;
  campaign_name: string;
};

export type DashboardLeadStatus = {
  agent_name: string;
  Status_10?: number;
  Status_11?: number;
  Status_12?: number;
  Status_13?: number;
};

export type DashboardLeadAssignmentLog = {
  lead_id: string;
  id: number;
  fullname: string;
  email: string | null;
  created_at: string;
  end_time: string;
  time_diff: number;
};

export type DashboardLeadEnquiry = {
  id: number;
  lead_id: number;
  rent_sell: string;
  location: string;
  budget: string;
  payment_type: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
  active: string;
  deleted_at: string | null;
  deleted_by: number | null;
  fullname: string | null;
  created_by_name: string;
};

export type EventItem = {
  event_id: number;
  event_title: string;
  event_desc: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:mm:ss
  event_location: string;
  invited_agents: string; // backend sends as string ("1")
  invited_agent_names: string;
  created_by: number;
  created_at: string; // YYYY-MM-DD HH:mm:ss
  updated_by: number | null;
  updated_at: string | null;
  deleted_by: number | null;
  deleted_at: string | null;
  active: "yes" | "no";
};

export type AgentLeadCountItem = {
  lead_count: number;
  agent_fullname: string | null;
};

export type CallCenterRawLeadCountItem = {
  lead_count: number;
  agent_fullname: string | null;
};
export type DashboardResponse = {
  message: string;
  status: number;
  data: {
    total_leads: number;
    lead_assignment_log: DashboardLeadAssignmentLog[];
    missed_followup: number;
    today_followup: number;
    future_followup: number;
    lead_counts: DashboardLeadCount[];
    activity_report: DashboardActivityReport[];
    campaign_details: DashboardCampaignDetail[];
    lead_status: DashboardLeadStatus[];
    role_master_id: number;
    view_all_lead_enquiry: DashboardLeadEnquiry[];
    events: EventItem[];
    all_lead_count: AgentLeadCountItem[];
    call_center_raw_data_count: CallCenterRawLeadCountItem[];
  };
};

export const loadDashboard = (payload: DashboardRequest) =>
  apiClient<DashboardResponse>("app-dashboard", {
    method: "POST",
    body: payload,
  });

// Accept Lead
export type AcceptLeadRequest = {
  lead_id: string | number;
  user_id: string;
};

export type AcceptLeadResponse = {
  message: string;
  status: number;
  data: {
    log_id: number;
  };
};

export const acceptLead = (payload: AcceptLeadRequest) =>
  apiClient<AcceptLeadResponse>("accept-lead", {
    method: "POST",
    body: payload,
  });

// Masters - Category
export type CategoryItem = {
  lcat_id: number;
  lcat_name: string;
};

export type CategoryResponse = {
  message: string;
  status: number;
  data: {
    category: CategoryItem[];
  };
};

export const loadCategories = () =>
  apiClient<CategoryResponse>("get-category", { method: "GET" });

// Masters - Property Requirement
export type PropertyTypeItem = {
  category_id: number;
  main_category_id: number;
  category_name: string;
  pfix: string;
  dfix: string;
  ctype: string;
  pf_category: string;
};

export type PropertyTypeResponse = {
  message: string;
  status: number;
  data: {
    property_type: PropertyTypeItem[];
  };
};

export const loadPropertyTypes = () =>
  apiClient<PropertyTypeResponse>("get-property-type", { method: "GET" });

// Masters - Lead Type
export type LeadTypeItem = {
  ltype_id: number;
  ltype_name: string;
};

export type LeadTypeResponse = {
  message: string;
  status: number;
  data: {
    lead_type: LeadTypeItem[];
  };
};

export const loadLeadTypes = () =>
  apiClient<LeadTypeResponse>("get-lead-type", { method: "GET" });

// Cities
export type CityItem = {
  city_id: number;
  country_id: number;
  country_prefix: string;
  city_name: string;
  sort: number;
};
export type CitiesResponse = {
  message: string;
  status: number;
  data: { cities: CityItem[] };
};
export const loadCities = () =>
  apiClient<CitiesResponse>("get-cities", { method: "GET" });

// Lead Status
export type LeadStatusItem = {
  lead_status_id: number;
  lead_status_name: string;
};
export type LeadStatusResponse = {
  message: string;
  status: number;
  data: { lead_status: LeadStatusItem[] };
};
export const loadLeadStatuses = () =>
  apiClient<LeadStatusResponse>("get-lead-status", { method: "GET" });

// Lead Sub Status (Main Status)
export type LeadMainStatusItem = {
  lead_main_status_id: number;
  lead_main_status_name: string;
};
export type LeadMainStatusesResponse = {
  message: string;
  status: number;
  data: { lead_main_statuses: LeadMainStatusItem[] };
};
export const loadLeadMainStatuses = () =>
  apiClient<LeadMainStatusesResponse>("get-lead-main-statuses", {
    method: "GET",
  });

// Lead Source
export type LeadSourceItem = {
  source_id: number;
  source_name: string;
  mstatus: number;
};
export type LeadSourceResponse = {
  message: string;
  status: number;
  data: { source: LeadSourceItem[] };
};
export const loadLeadSources = () =>
  apiClient<LeadSourceResponse>("get-lead-source", { method: "GET" });

// Lead Channel
export type LeadChannelItem = {
  cid: number;
  source_ids: string;
  cname: string;
};
export type LeadChannelResponse = {
  message: string;
  status: number;
  data: { lead_channel: LeadChannelItem[] };
};
export const loadLeadChannels = () =>
  apiClient<LeadChannelResponse>("get-lead-channel", { method: "GET" });

// Lead Campaign
export type LeadCampaignItem = {
  campaign_id: number;
  campaign_name: string;
  campaign_type: number;
  rstatus: number;
  start_date: string;
  end_date: string;
  form_name: string | null;
  broucher: string | null;
};
export type LeadCampaignResponse = {
  message: string;
  status: number;
  data: { lead_campaign: LeadCampaignItem[] };
};
export const loadLeadCampaigns = () =>
  apiClient<LeadCampaignResponse>("get-lead-campaign", { method: "GET" });

// Lead Activity Type

export type leadActivityItem = {
  history_type_id: number;
  history_type: number;
  history_type_name: string;
  status: number;
};

export type LeadActivityTypeResponse = {
  message: string;
  status: number;
  data: { lead_activity_type: leadActivityItem[] };
};
export const loadLeadActivityTypes = () =>
  apiClient<LeadActivityTypeResponse>("get-lead-activity-type", {
    method: "GET",
  });

// Lead Agents
export type LeadAgentItem = {
  user_id: number;
  display_name: string;
  status: number;
};
export type LeadAgentsResponse = {
  message: string;
  status: number;
  data: { lead_agents: LeadAgentItem[] };
};

export const loadLeadAgents = (userId: number) =>
  apiClient<LeadAgentsResponse>("get-lead-agents", {
    method: "GET",
    query: { user_id: userId },
  });

// Lead Sanity
export type LeadSanityItem = { id: number; name: string };
export type LeadSanityResponse = {
  message: string;
  status: number;
  data: { lead_sanity: LeadSanityItem[] };
};
export const loadLeadSanity = () =>
  apiClient<LeadSanityResponse>("get-lead-sanity", { method: "GET" });

// Save Lead
export type SaveLeadRequest = {
  lead_category: number;
  lead_name: string;
  lead_property_requirement: number;
  lead_type: number;
  lead_city: number;
  lead_status: number;
  lead_sub_status: number;
  lead_source: number;
  lead_mobile: string;
  lead_channel: number;
  lead_campaign: number;
  lead_notes: string;
  lead_id: string | number | ""; // empty string when creating
  lead_email: string;
  hot_lead: number;
  lead_company: string;
  lead_agent: number;
  role_master_id: number;
  lead_sanity: number;
  device: string;
  app_version: string;
  user_id: string;
};

export type SaveLeadResponse = {
  message: string;
  status: number;
  data: { lead_id: number };
};

export const saveLead = (payload: SaveLeadRequest) =>
  apiClient<SaveLeadResponse>("save-lead", {
    method: "POST",
    body: payload,
  });

// Filter Leads (filter-lead-app)
// NOTE: This endpoint needs a JSON body, so use POST (even if docs say GET).
export type FilterLeadAppRequest = {
  user_id: string;
  page_no: string | number;
  limit: string | number;

  lead_id?: string;
  hot_lead?: string;
  filter_firstname?: string;
  filter_mobile?: string;
  filter_email?: string;
  filter_phone?: string;
  filter_lead_main_type?: string;
  filter_lead_type?: string;
  filter_lead_status?: string;
  filter_lead_sub_status?: string;
  filter_category?: string;
  filter_agent?: string;
  filter_source?: string;
  filter_channel?: string;
  filter_campaigns?: string;
  lead_sanity?: string;
  date_created?: string;
  type?:
    | ""
    | "Unattended"
    | "Assigned"
    | "PendingToAccept"
    | "no_action"
    | string;
};

export type FilterLeadAppItem = {
  lead_id: number;
  pfix: string;
  date_created: string;
  firstname: string;
  lastname: string;
  mobile: string;
  phone: string;
  email: string;
  company_name: string;
  ltype_id?: number;
  ltype_name?: string;
  lead_status_name: string;
  lead_sub_status_name: string;
  category_name: string;
  city_name: string;
  source_name: string;
  channel_name: string;
  campaign_name: string;
  agent_fullname: string;
  lead_main_status_name: string;
  enc_id: string;
  [key: string]: unknown;
  enquiry_date: string;
};

export type FilterLeadAppResponse = {
  message: string;
  status: number;
  data: {
    recordsTotal: number;
    recordsFiltered: number;
    data: FilterLeadAppItem[];
  };
};

export const filterLeadApp = (payload: FilterLeadAppRequest) =>
  apiClient<FilterLeadAppResponse>("filter-lead-app", {
    method: "POST",
    body: payload,
  });

export type LeadDetailItem = {
  lead_id: number;
  pfix: string;
  is_report_sent: number;
  source_id: number | null;
  history_type: string | null;
  date_created: string;
  account_id: number;
  created_by: number;

  firstname: string;
  lastname: string | null;
  fullname: string;
  mobile: string;
  phone: string;
  email: string;
  company_name: string | null;

  lead_status_id: number;
  lead_status_name: string;
  lead_sub_status_id: number;
  lead_sub_status_name: string;

  lead_main_status_id: number;
  lead_main_status_name: string;
  lead_main_type: string;

  ltype_id: number;
  ltype_name: string;

  campaign_id: number;
  campaign_name: string;

  category_id: number;
  category_name: string;

  country_id: number;
  country_name: string;
  city_id: number;
  city_name: string;

  agent_fullname: string;
  created_by_name: string;

  enquiry_date: string;
  followup_date: string | null;
  close_date: string | null;
  updated: string;

  hot_lead: number;
  priority: number;

  source_name: string | null;
  channel_name: string;

  is_unattended: number;
  quality_status: string;

  lead_sanity: number;

  [key: string]: unknown; // backend safety net
};

export type GetLeadDetailRequest = {
  lead_id: string;
};

export type GetLeadDetailResponse = {
  message: string;
  status: number;
  data: {
    lead_detail: LeadDetailItem[];
  };
};

export const getLeadDetails = (payload: GetLeadDetailRequest) =>
  apiClient<GetLeadDetailResponse>("get-lead-detail", {
    method: "GET",
    query: {
      lead_id: payload.lead_id, // 🔥 yahin bhejna hai
    },
  });
