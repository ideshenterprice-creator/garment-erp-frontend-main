import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreatePurchaseOrderPayload,
  POFabricLot,
  POListSummary,
  POProductionStages,
  PurchaseOrder,
} from "@/types";
import type { ListParams } from "@/services/masters.service";

export type POListResponse = PaginatedResponse<PurchaseOrder> & {
  summary: POListSummary;
};

export interface POProductionStatusResponse {
  poId: string;
  poNumber: string;
  status: PurchaseOrder["status"];
  totalPieces: number;
  stages: POProductionStages;
}

export interface POFabricLotsResponse {
  poId: string;
  poNumber: string;
  totalFabricRequired: number;
  lots: POFabricLot[];
  totalFabricReceived: number;
}

export async function getPurchaseOrders(
  params?: ListParams
): Promise<ApiResponse<POListResponse>> {
  const response = await api.get<ApiResponse<POListResponse>>(
    "/purchase-orders",
    { params }
  );
  return response.data;
}

export async function getPurchaseOrderById(
  id: string
): Promise<ApiResponse<PurchaseOrder>> {
  const response = await api.get<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}`
  );
  return response.data;
}

export async function createPurchaseOrder(
  data: CreatePurchaseOrderPayload
): Promise<ApiResponse<PurchaseOrder>> {
  const response = await api.post<ApiResponse<PurchaseOrder>>(
    "/purchase-orders",
    data
  );
  return response.data;
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<CreatePurchaseOrderPayload>
): Promise<ApiResponse<PurchaseOrder>> {
  const response = await api.put<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}`,
    data
  );
  return response.data;
}

export async function cancelPurchaseOrder(
  id: string,
  reason: string
): Promise<ApiResponse<PurchaseOrder>> {
  const response = await api.patch<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}/cancel`,
    { reason }
  );
  return response.data;
}

export async function deletePurchaseOrder(
  id: string
): Promise<ApiResponse<{ id: string; message: string }>> {
  const response = await api.delete<ApiResponse<{ id: string; message: string }>>(
    `/purchase-orders/${id}`
  );
  return response.data;
}

export async function getPOProductionStatus(
  id: string
): Promise<ApiResponse<POProductionStatusResponse>> {
  const response = await api.get<ApiResponse<POProductionStatusResponse>>(
    `/purchase-orders/${id}/production-status`
  );
  return response.data;
}

export async function getPOFabricLots(
  id: string
): Promise<ApiResponse<POFabricLotsResponse>> {
  const response = await api.get<ApiResponse<POFabricLotsResponse>>(
    `/purchase-orders/${id}/fabric-lots`
  );
  return response.data;
}
