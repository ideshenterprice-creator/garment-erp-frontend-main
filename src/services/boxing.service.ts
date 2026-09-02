import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AddBoxToContainerPayload,
  BoxPacking,
  BoxesListResponse,
  Container,
  ContainerDetail,
  CreateBoxPayload,
  CreateContainerPayload,
  MarkDispatchedPayload,
} from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getBoxes(
  params?: ListParams
): Promise<ApiResponse<BoxesListResponse>> {
  const response = await api.get<ApiResponse<BoxesListResponse>>(
    "/boxing/boxes",
    { params }
  );
  return response.data;
}

export async function createBox(
  data: CreateBoxPayload
): Promise<ApiResponse<BoxPacking>> {
  const response = await api.post<ApiResponse<BoxPacking>>(
    "/boxing/boxes",
    data
  );
  return response.data;
}

export async function deleteBox(
  id: string
): Promise<ApiResponse<{ id: string; message: string }>> {
  const response = await api.delete<ApiResponse<{ id: string; message: string }>>(
    `/boxing/boxes/${id}`
  );
  return response.data;
}

export async function getContainers(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Container>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Container>>>(
    "/boxing/containers",
    { params }
  );
  return response.data;
}

export async function getContainerById(
  id: string
): Promise<ApiResponse<ContainerDetail>> {
  const response = await api.get<ApiResponse<ContainerDetail>>(
    `/boxing/containers/${id}`
  );
  return response.data;
}

export async function createContainer(
  data: CreateContainerPayload
): Promise<ApiResponse<Container>> {
  const response = await api.post<ApiResponse<Container>>(
    "/boxing/containers",
    data
  );
  return response.data;
}

export async function addBoxToContainer(
  containerId: string,
  data: AddBoxToContainerPayload
): Promise<ApiResponse<ContainerDetail>> {
  const response = await api.patch<ApiResponse<ContainerDetail>>(
    `/boxing/containers/${containerId}/add-box`,
    data
  );
  return response.data;
}

export async function markContainerReady(
  id: string
): Promise<ApiResponse<Container>> {
  const response = await api.patch<ApiResponse<Container>>(
    `/boxing/containers/${id}/mark-ready`
  );
  return response.data;
}

export async function markContainerDispatched(
  id: string,
  data: MarkDispatchedPayload
): Promise<ApiResponse<Container>> {
  const response = await api.patch<ApiResponse<Container>>(
    `/boxing/containers/${id}/mark-dispatched`,
    data
  );
  return response.data;
}

export async function deleteContainer(
  id: string
): Promise<ApiResponse<{ id: string; message: string }>> {
  const response = await api.delete<ApiResponse<{ id: string; message: string }>>(
    `/boxing/containers/${id}`
  );
  return response.data;
}
