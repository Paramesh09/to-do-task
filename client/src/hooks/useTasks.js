import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksApi } from '../api/tasks';
import { userTimeZone } from '../lib/dates';

export const taskKeys = {
  all: ['tasks'],
  lists: () => ['tasks', 'list'],
  list: (params) => ['tasks', 'list', params],
  weeks: (tz) => ['tasks', 'weeks', tz],
};

export function useWeeklySummary() {
  const tz = userTimeZone();
  return useQuery({
    queryKey: taskKeys.weeks(tz),
    queryFn: () => tasksApi.weeks(tz),
  });
}

export function useTasks(params, options = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.list(params),
    ...options,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      toast.success('Task added');
      return queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// Updates are applied to the cached lists straight away so ticking a checkbox
// feels instant. If the request fails we put the old data back.
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }) => tasksApi.update(id, changes),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshot = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (tasks) =>
        tasks?.map((task) => (task.id === id ? { ...task, ...changes } : task))
      );
      return { snapshot };
    },
    onError: (err, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.remove,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshot = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (tasks) =>
        tasks?.filter((task) => task.id !== id)
      );
      return { snapshot };
    },
    onSuccess: () => toast.success('Task deleted'),
    onError: (err, _id, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
