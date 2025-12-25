import { apiClient } from "@/utils/apiClient";

export type SaveActivityRequest = {
  lead_id: string; // encrypted
  user_id: string; // encrypted
  activity_type: number; // activity_type_id
  activity_notes: string;
  followup_date?: string; // ISO datetime (YYYY-MM-DD HH:mm:ss)
};

export type SaveActivityResponse = {
  status: number;
  message: string;
  data: null;
};

export const saveLeadActivity = (payload: SaveActivityRequest) =>
  apiClient<SaveActivityResponse>("save-activity-app", {
    method: "POST",
    body: payload,
  });

// get lead acitivity item
export type LeadActivityItem = {
  followup: string | null;
  history_id: number;
  note: string;
  date: string; // "YYYY-MM-DD HH:mm:ss"
  history_type_name: string;
  display_name: string;
};

export type GetLeadActivitiesRequest = {
  lead_id: string; // encrypted
  user_id: string; // encrypted
};

export type GetLeadActivitiesResponse = {
  message: string;
  status: number;
  data: {
    lead_activities: LeadActivityItem[];
  };
};

// api/leadActivities.ts
export const getLeadActivities = (payload: GetLeadActivitiesRequest) =>
  apiClient<GetLeadActivitiesResponse>("get-lead-activities-app", {
    method: "GET",
    query: payload,
  });

export type SaveNotesPayload = {
  lead_id: string; // encrypted
  user_id: string; // encrypted
  notes_comments: string;
};

// post api lead notes
// types/notes.types.ts

export type SaveNoteRequest = {
  lead_id: string; // encrypted
  user_id: string; // encrypted
  notes_comments: string;
};

export type SaveNoteResponse = {
  message: string;
  status: number;
  data: null;
};

export const saveLeadNote = (payload: SaveNoteRequest) =>
  apiClient<SaveNoteResponse>("save-notes-app", {
    method: "POST",
    body: payload,
  });

// get lead notes
export type LoadNotesRequest = {
  lead_id: string; // encrypted
  user_id: string; // encrypted
};

export type LeadNoteItem = {
  note_details: string;
  date: string;
  fullname: string;
};

export type LoadNotesResponse = {
  message: string;
  status: number;
  data: {
    notes: LeadNoteItem[];
  };
};

export const loadLeadNotes = (payload: LoadNotesRequest) =>
  apiClient<LoadNotesResponse>("load-notes-app", {
    method: "GET",
    query: {
      lead_id: payload.lead_id,
      user_id: payload.user_id,
    },
  });

// update lead data api
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
  lead_id?: string; // 🔥 if present → UPDATE, if empty → CREATE
  lead_email: string;
  hot_lead: number;
  lead_company: string;
  lead_agent: number;
  role_master_id: number;
  lead_sanity: number;
  device: string;
  app_version: string;
  user_id: string; // encrypted
};

export type SaveLeadResponse = {
  message: string;
  status: number;
  data: null;
};

export const UpdateLeadData = (payload: SaveLeadRequest) => {
  apiClient<SaveLeadResponse>("save-lead", {
    method: "POST",
    body: payload,
  });
};
