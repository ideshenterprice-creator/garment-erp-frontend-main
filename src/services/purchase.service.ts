import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreatePurchaseBillPayload,
  PurchaseBill,
  PurchaseBillsSummary,
  PurchaseRegisterResponse,
} from "@/types";
import type { ListParams } from "@/services/masters.service";

export type PurchaseBillsListResponse = PaginatedResponse<PurchaseBill> & {
  summary: PurchaseBillsSummary;
};

export async function getPurchaseBills(
  params?: ListParams
): Promise<ApiResponse<PurchaseBillsListResponse>> {
  const response = await api.get<ApiResponse<PurchaseBillsListResponse>>(
    "/purchase/bills",
    { params }
  );
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
  data: CreatePurchaseBillPayload
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

export async function deletePurchaseBill(
  id: string
): Promise<ApiResponse<{ id: string; message: string }>> {
  const response = await api.delete<ApiResponse<{ id: string; message: string }>>(
    `/purchase/bills/${id}`
  );
  return response.data;
}

export async function getPurchaseRegister(
  params?: ListParams
): Promise<ApiResponse<PurchaseRegisterResponse>> {
  const response = await api.get<ApiResponse<PurchaseRegisterResponse>>(
    "/purchase/register",
    { params }
  );
  return response.data;
}

export async function exportPurchaseRegister(
  params?: ListParams
): Promise<void> {
  const { downloadFromApi } = await import("@/lib/download");
  await downloadFromApi("/purchase/register/export", "purchase-register.csv", params);
}
