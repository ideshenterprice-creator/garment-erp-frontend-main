import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { PurchaseBill } from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getPurchaseBills(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<PurchaseBill>>> {
  const response = await api.get<
    ApiResponse<PaginatedResponse<PurchaseBill>>
  >("/purchase/bills", { params });
  return response.data;
}

export async function getPurchaseBillById(
  id: string
): Promise<ApiResponse<PurchaseBill>> {
  const response = await api.get<ApiResponse<PurchaseBill>>(
    `/purchase/bills/${id}`
  );
  return response.data;
}

export async function createPurchaseBill(
  data: Partial<PurchaseBill>
): Promise<ApiResponse<PurchaseBill>> {
  const response = await api.post<ApiResponse<PurchaseBill>>(
    "/purchase/bills",
    data
  );
  return response.data;
}

export async function confirmPurchaseBill(
  id: string
): Promise<ApiResponse<PurchaseBill>> {
  const response = await api.patch<ApiResponse<PurchaseBill>>(
    `/purchase/bills/${id}/confirm`
  );
  return response.data;
}

export async function returnPurchaseBill(
  id: string,
  reason: string
): Promise<ApiResponse<PurchaseBill>> {
  const response = await api.patch<ApiResponse<PurchaseBill>>(
    `/purchase/bills/${id}/return`,
    { reason }
  );
  return response.data;
}

export async function getPurchaseRegister(
  params?: ListParams
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>("/purchase/register", {
    params,
  });
  return response.data;
}
