import { apiClient } from "@/utils/apiClient";

export type TaskItem = {
  task: string;
  subtask: number;
};

export type SaveTasksRequest = {
  tasks: TaskItem[];
  user_id: string; // encrypted user_id
};

export type SaveTaskResponse = {
  message: string;
  status: number;
  data: null;
};

export const saveTask = (payload: SaveTasksRequest) =>
  apiClient<SaveTaskResponse>("save-tasks-app", {
    method: "POST",
    body: payload,
  });

export type MyTaskItem = {
  id: number;
  agent_id: number;
  task_date: string;
  task_description: string;
  task_time: number;
  created_at: string;
  deleted_at: string | null;
  deleted_by: number | null;
};

export type MyTaskRequest = {
  user_id: string; // encrypted
  date?: string; // YYYY-MM-DD
};

export type MyTaskResponse = {
  message: string;
  status: number;
  data: {
    task_details: MyTaskItem[];
  };
};

export const getMyTasks = (payload: MyTaskRequest) =>
  apiClient<MyTaskResponse>("my-task-app", {
    method: "GET",
    query: {
      user_id: payload.user_id,
      date: payload.date,
    },
  });

export type TeamTaskRequest = {
  user_id: string; // encrypted
  date?: string; // YYYY-MM-DD
  agent_id?: string;
};

export const getTeamTask = (payload: TeamTaskRequest) =>
  apiClient<MyTaskResponse>("my-task-app", {
    method: "GET",
    query: {
      user_id: payload.user_id,
      date: payload.date,
      agent_id: payload.agent_id,
    },
  });
