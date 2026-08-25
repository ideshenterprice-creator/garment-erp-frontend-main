import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { IssueRecord, Stock } from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getStock(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Stock>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Stock>>>(
    "/inventory/stock",
    { params }
  );
  return response.data;
}

export async function getStockByProduct(
  productId: string
): Promise<ApiResponse<Stock>> {
  const response = await api.get<ApiResponse<Stock>>(
    `/inventory/stock/${productId}`
  );
  return response.data;
}

export async function adjustStock(
  productId: string,
  data: { quantity: number; reason?: string; notes?: string }
): Promise<ApiResponse<Stock>> {
  const response = await api.post<ApiResponse<Stock>>(
    `/inventory/stock/${productId}/adjust`,
    data
  );
  return response.data;
}

export async function getIssues(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<IssueRecord>>> {
  const response = await api.get<
    ApiResponse<PaginatedResponse<IssueRecord>>
  >("/inventory/issues", { params });
  return response.data;
}

export async function createIssue(
  data: Partial<IssueRecord>
): Promise<ApiResponse<IssueRecord>> {
  const response = await api.post<ApiResponse<IssueRecord>>(
    "/inventory/issues",
    data
  );
  return response.data;
}

export async function getWastage(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/inventory/wastage",
    { params }
  );
  return response.data;
}

export async function createWastage(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/inventory/wastage",
    data
  );
  return response.data;
}
