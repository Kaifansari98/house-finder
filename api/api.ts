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
