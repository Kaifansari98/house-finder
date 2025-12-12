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
