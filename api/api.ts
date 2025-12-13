import { apiClient } from '@/utils/apiClient';

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
  };
};

export const login = (payload: LoginRequest) =>
  apiClient<LoginResponse>('app-login', {
    method: 'POST',
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
  apiClient<SidebarResponse>('app-load-menu', {
    method: 'POST',
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

export type DashboardResponse = {
  message: string;
  status: number;
  data: {
    total_leads: number;
    lead_assignment_log: unknown[];
    missed_followup: number;
    today_followup: number;
    future_followup: number;
    lead_counts: DashboardLeadCount[];
    activity_report: DashboardActivityReport[];
    campaign_details: DashboardCampaignDetail[];
    lead_status: DashboardLeadStatus[];
    role_master_id: number;
    view_all_lead_enquiry: DashboardLeadEnquiry[];
  };
};

export const loadDashboard = (payload: DashboardRequest) =>
  apiClient<DashboardResponse>('app-dashboard', {
    method: 'POST',
    body: payload,
  });
