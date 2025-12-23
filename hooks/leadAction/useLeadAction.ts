import {
  getLeadActivities,
  GetLeadActivitiesRequest,
  GetLeadActivitiesResponse,
  loadLeadNotes,
  SaveActivityRequest,
  SaveActivityResponse,
  saveLeadActivity,
  saveLeadNote,
  SaveLeadRequest,
  SaveNoteRequest,
  UpdateLeadData,
} from "@/api/leadactionapi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSaveLeadActivity = () => {
  return useMutation<SaveActivityResponse, Error, SaveActivityRequest>({
    mutationFn: saveLeadActivity,
  });
};

export const useLeadActivities = (payload?: GetLeadActivitiesRequest) => {
  return useQuery<GetLeadActivitiesResponse, Error>({
    queryKey: ["lead-activities", payload?.lead_id],
    queryFn: () => getLeadActivities(payload as GetLeadActivitiesRequest),

    enabled: !!payload?.lead_id && !!payload?.user_id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// hooks/notes/useSaveLeadNote.ts
export const useSaveLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveNoteRequest) => {
      return saveLeadNote(payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lead-notes", variables.lead_id],
      });
    },
  });
};

// action lead notes get hook
export const useLeadNotes = (lead_id?: string, user_id?: string) => {
  return useQuery({
    queryKey: ["lead-notes", lead_id],
    queryFn: async () => {
      const res = await loadLeadNotes({
        lead_id: lead_id as string,
        user_id: user_id as string,
      });

      // ✅ ALWAYS return something
      return res?.data?.notes ?? [];
    },
    enabled: !!lead_id && !!user_id,
    staleTime: 1000 * 60 * 5,
  });
};

// update lead data hook
export const useUpdateLeadData = () => {
  return useMutation({
    mutationFn: async (payload: SaveLeadRequest) => {
      return UpdateLeadData(payload);
    },
  });
};
