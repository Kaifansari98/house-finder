import { apiClient } from "@/utils/apiClient";

export type LeadEnquiryItem = {
  id: number;
  lead_id: number;
  rent_sell: string; // "1" | "2"
  location: string;
  budget: string;
  payment_type: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
  active: "Yes" | "No";
  deleted_at: string | null;
  deleted_by: number | null;
  fullname: string | null;
};

export type ViewAllLeadEnquiryRequest = {
  user_id: string; // encrypted user id
};

export type ViewAllLeadEnquiryResponse = {
  message: string;
  status: number;
  data: {
    all_enquiry: LeadEnquiryItem[];
  };
};

export const getAllLeadEnquiries = (payload: ViewAllLeadEnquiryRequest) =>
  apiClient<ViewAllLeadEnquiryResponse>("app-view-all-lead-enquiry", {
    method: "GET",
    query: {
      user_id: payload.user_id,
    },
  });

export type SaveLeadEnquiryRequest = {
  user_id: string; // encrypted user id
  lead_enquiry_id?: string; // edit (optional)
  lead_id?: string; // "0" ya actual lead id
  rentsell: string; // 1 = rent, 2 = sell
  location: string;
  budget: string;
  payment_type: string;
  description: string;
};

export type SaveLeadEnquiryResponse = {
  message: string;
  status: number;
  data: null;
};

export const saveLeadEnquiry = (payload: SaveLeadEnquiryRequest) =>
  apiClient<SaveLeadEnquiryResponse>("app-save-lead-enquiry", {
    method: "POST",
    body: payload,
  });
