import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { login, type LoginRequest, type LoginResponse } from '../../api/api';

export const useLogin = (
  options?: UseMutationOptions<LoginResponse, Error, LoginRequest>,
): UseMutationResult<LoginResponse, Error, LoginRequest> =>
  useMutation<LoginResponse, Error, LoginRequest>({
    mutationKey: ['login'],
    mutationFn: login,
    ...options,
  });
