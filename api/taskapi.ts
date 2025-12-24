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
  created_by: number;
  created_at: string;
  active: "Yes" | "No";
  deleted_at: string | null;
  deleted_by: number | null;
};

export type MyTaskRequest = {
  user_id: string; // encrypted
  date?: string;    // YYYY-MM-DD
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