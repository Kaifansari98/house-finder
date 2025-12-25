import { apiClient } from "@/utils/apiClient";

export type LeadEnquiryItem = {
  id: number;
  lead_id: number;
  rent_sell: string;        // "1" | "2"
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






export const getAllLeadEnquiries = (
  payload: ViewAllLeadEnquiryRequest
) =>
  apiClient<ViewAllLeadEnquiryResponse>("app-view-all-lead-enquiry", {
    method: "GET",
    query: {
      user_id: payload.user_id,
    },
  });
