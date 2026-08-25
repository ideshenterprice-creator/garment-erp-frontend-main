import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AdjustStockPayload,
  CreateIssuePayload,
  CreateWastagePayload,
  CuttingWastage,
  IssueRecord,
  Stock,
  WastageListResponse,
} from "@/types";
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
  data: AdjustStockPayload
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
  const response = await api.get<ApiResponse<PaginatedResponse<IssueRecord>>>(
    "/inventory/issues",
    { params }
  );
  return response.data;
}

export async function createIssue(
  data: CreateIssuePayload
): Promise<ApiResponse<IssueRecord>> {
  const response = await api.post<ApiResponse<IssueRecord>>(
    "/inventory/issues",
    data
  );
  return response.data;
}

export async function getWastage(
  params?: ListParams
): Promise<ApiResponse<WastageListResponse>> {
  const response = await api.get<ApiResponse<WastageListResponse>>(
    "/inventory/wastage",
    { params }
  );
  return response.data;
}

export async function createWastage(
  data: CreateWastagePayload
): Promise<ApiResponse<CuttingWastage>> {
  const response = await api.post<ApiResponse<CuttingWastage>>(
    "/inventory/wastage",
    data
  );
  return response.data;
}

export async function markWastageSold(
  id: string
): Promise<ApiResponse<CuttingWastage>> {
  const response = await api.patch<ApiResponse<CuttingWastage>>(
    `/inventory/wastage/${id}/mark-sold`
  );
  return response.data;
}
