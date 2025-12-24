import {
  getMyTasks,
  MyTaskRequest,
  saveTask,
  SaveTasksRequest,
} from "@/api/taskapi";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useSaveTasks = () => {
  return useMutation({
    mutationFn: (payload: SaveTasksRequest) => saveTask(payload),
  });
};

export const useMyTasks = (payload?: MyTaskRequest) => {
  return useQuery({
    queryKey: ["my-tasks",],
    queryFn: async () => {
      const res = await getMyTasks(payload as MyTaskRequest);
      return res.data.task_details;
    },
    enabled: !!payload?.user_id && !!payload?.date,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
};
