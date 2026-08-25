import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { AccountStatement, KarigarPayment } from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getKarigarPayments(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<KarigarPayment>>> {
  const response = await api.get<
    ApiResponse<PaginatedResponse<KarigarPayment>>
  >("/accounts/karigar-payments", { params });
  return response.data;
}

export async function confirmKarigarPayment(
  id: string,
  data: Record<string, unknown>
): Promise<ApiResponse<KarigarPayment>> {
  const response = await api.patch<ApiResponse<KarigarPayment>>(
    `/accounts/karigar-payments/${id}/confirm`,
    data
  );
  return response.data;
}

export async function getSupplierPayments(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/accounts/supplier-payments",
    { params }
  );
  return response.data;
}

export async function recordSupplierPayment(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/accounts/supplier-payments",
    data
  );
  return response.data;
}

export async function getVouchers(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<unknown>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<unknown>>>(
    "/accounts/vouchers",
    { params }
  );
  return response.data;
}

export async function createVoucher(
  data: Record<string, unknown>
): Promise<ApiResponse<unknown>> {
  const response = await api.post<ApiResponse<unknown>>(
    "/accounts/vouchers",
    data
  );
  return response.data;
}

export async function getAccountStatement(
  params?: ListParams
): Promise<ApiResponse<AccountStatement>> {
  const response = await api.get<ApiResponse<AccountStatement>>(
    "/accounts/statement",
    { params }
  );
  return response.data;
}
