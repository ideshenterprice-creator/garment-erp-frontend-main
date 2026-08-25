import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { PurchaseOrder } from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getPurchaseOrders(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<PurchaseOrder>>> {
  const response = await api.get<
    ApiResponse<PaginatedResponse<PurchaseOrder>>
  >("/purchase-orders", { params });
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
  data: Partial<PurchaseOrder>
): Promise<ApiResponse<PurchaseOrder>> {
  const response = await api.post<ApiResponse<PurchaseOrder>>(
    "/purchase-orders",
    data
  );
  return response.data;
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<PurchaseOrder>
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

export async function getPOProductionStatus(
  id: string
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>(
    `/purchase-orders/${id}/production-status`
  );
  return response.data;
}

export async function getPOFabricLots(
  id: string
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>(
    `/purchase-orders/${id}/fabric-lots`
  );
  return response.data;
}
