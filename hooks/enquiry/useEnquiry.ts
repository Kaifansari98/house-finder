import { getAllLeadEnquiries, ViewAllLeadEnquiryRequest } from "@/api/enquiryapi";
import { useQuery } from "@tanstack/react-query";

export const useAllLeadEnquiries = (
  payload?: ViewAllLeadEnquiryRequest
) => {
  return useQuery({
    queryKey: ["all-lead-enquiries", payload?.user_id],
    queryFn: async () => {
      const res = await getAllLeadEnquiries(
        payload as ViewAllLeadEnquiryRequest
      );
      return res.data.all_enquiry;
    },
    enabled: !!payload?.user_id,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
};
