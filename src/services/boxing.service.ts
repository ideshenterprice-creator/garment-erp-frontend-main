import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { ListParams } from "@/services/masters.service";

export async function getBoxes(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/boxing/boxes",
    { params }
  );
  return response.data;
}

export async function createBox(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/boxing/boxes",
    data
  );
  return response.data;
}

export async function getContainers(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/boxing/containers",
    { params }
  );
  return response.data;
}

export async function getContainerById(
  id: string
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>(
    `/boxing/containers/${id}`
  );
  return response.data;
}

export async function createContainer(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/boxing/containers",
    data
  );
  return response.data;
}

export async function addBoxToContainer(
  containerId: string,
  boxId: string
): Promise<ApiResponse<unknown>> {
  const response = await api.patch<ApiResponse<unknown>>(
    `/boxing/containers/${containerId}/add-box`,
    { boxId }
  );
  return response.data;
}

export async function markContainerReady(
  id: string
): Promise<ApiResponse<unknown>> {
  const response = await api.patch<ApiResponse<unknown>>(
    `/boxing/containers/${id}/mark-ready`
  );
  return response.data;
}

export async function markContainerDispatched(
  id: string,
  date: string
): Promise<ApiResponse<unknown>> {
  const response = await api.patch<ApiResponse<unknown>>(
    `/boxing/containers/${id}/mark-dispatched`,
    { date }
  );
  return response.data;
}
