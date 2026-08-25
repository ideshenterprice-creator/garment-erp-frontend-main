import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { SalesBill } from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getSalesBills(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<SalesBill>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<SalesBill>>>(
    "/sales/bills",
    { params }
  );
  return response.data;
}

export async function getSalesBillById(
  id: string
): Promise<ApiResponse<SalesBill>> {
  const response = await api.get<ApiResponse<SalesBill>>(
    `/sales/bills/${id}`
  );
  return response.data;
}

export async function createSalesBill(
  data: Partial<SalesBill>
): Promise<ApiResponse<SalesBill>> {
  const response = await api.post<ApiResponse<SalesBill>>(
    "/sales/bills",
    data
  );
  return response.data;
}

export async function submitSalesBill(
  id: string
): Promise<ApiResponse<SalesBill>> {
  const response = await api.patch<ApiResponse<SalesBill>>(
    `/sales/bills/${id}/submit`
  );
  return response.data;
}

export async function recordSalesPayment(
  id: string,
  data: Record<string, unknown>
): Promise<ApiResponse<SalesBill>> {
  const response = await api.patch<ApiResponse<SalesBill>>(
    `/sales/bills/${id}/record-payment`,
    data
  );
  return response.data;
}

export async function returnSalesBill(
  id: string,
  reason: string
): Promise<ApiResponse<SalesBill>> {
  const response = await api.patch<ApiResponse<SalesBill>>(
    `/sales/bills/${id}/return`,
    { reason }
  );
  return response.data;
}

export async function getSalesRegister(
  params?: ListParams
): Promise<ApiResponse<unknown>> {
  const response = await api.get<ApiResponse<unknown>>("/sales/register", {
    params,
  });
  return response.data;
}

export async function getNotes(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/sales/notes",
    { params }
  );
  return response.data;
}

export async function createNote(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>("/sales/notes", data);
  return response.data;
}
