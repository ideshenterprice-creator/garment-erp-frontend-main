import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Bundle } from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getCuttingEntries(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/production/cutting",
    { params }
  );
  return response.data;
}

export async function createCuttingEntry(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/production/cutting",
    data
  );
  return response.data;
}

export async function getPrintingEntries(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/production/printing",
    { params }
  );
  return response.data;
}

export async function createPrintingEntry(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/production/printing",
    data
  );
  return response.data;
}

export async function getColoringEntries(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/production/coloring",
    { params }
  );
  return response.data;
}

export async function createColoringEntry(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/production/coloring",
    data
  );
  return response.data;
}

export async function getStitchingEntries(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/production/stitching",
    { params }
  );
  return response.data;
}

export async function createStitchingEntry(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/production/stitching",
    data
  );
  return response.data;
}

export async function getFinishingEntries(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/production/finishing",
    { params }
  );
  return response.data;
}

export async function createFinishingEntry(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/production/finishing",
    data
  );
  return response.data;
}

export async function getBundleByNumber(
  bundleNumber: string
): Promise<ApiResponse<Bundle>> {
  const response = await api.get<ApiResponse<Bundle>>(
    `/production/bundles/${bundleNumber}`
  );
  return response.data;
}

export async function getBundleJourney(
  bundleNumber: string
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>(
    `/production/bundles/${bundleNumber}/journey`
  );
  return response.data;
}

export async function getBundlePayments(
  bundleNumber: string
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>(
    `/production/bundles/${bundleNumber}/payments`
  );
  return response.data;
}
