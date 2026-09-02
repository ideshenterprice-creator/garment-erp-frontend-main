import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AccountStatement,
  ConfirmKarigarPaymentPayload,
  CreateVoucherPayload,
  KarigarPayment,
  KarigarPaymentsListResponse,
  RecordSupplierPaymentPayload,
  SupplierBillPaymentRow,
  SupplierPaymentsListResponse,
  Voucher,
} from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getKarigarPayments(
  params?: ListParams
): Promise<ApiResponse<KarigarPaymentsListResponse>> {
  const response = await api.get<ApiResponse<KarigarPaymentsListResponse>>(
    "/accounts/karigar-payments",
    { params }
  );
  return response.data;
}

export async function confirmKarigarPayment(
  id: string,
  data: ConfirmKarigarPaymentPayload
): Promise<ApiResponse<KarigarPayment>> {
  const response = await api.patch<ApiResponse<KarigarPayment>>(
    `/accounts/karigar-payments/${id}/confirm`,
    data
  );
  return response.data;
}

export async function deleteKarigarPayment(
  id: string
): Promise<ApiResponse<{ id: string; message: string }>> {
  const response = await api.delete<ApiResponse<{ id: string; message: string }>>(
    `/accounts/karigar-payments/${id}`
  );
  return response.data;
}

export async function getSupplierPayments(
  params?: ListParams
): Promise<ApiResponse<SupplierPaymentsListResponse>> {
  const response = await api.get<ApiResponse<SupplierPaymentsListResponse>>(
    "/accounts/supplier-payments",
    { params }
  );
  return response.data;
}

export async function recordSupplierPayment(
  data: RecordSupplierPaymentPayload
): Promise<ApiResponse<SupplierBillPaymentRow>> {
  const response = await api.post<ApiResponse<SupplierBillPaymentRow>>(
    "/accounts/supplier-payments",
    data
  );
  return response.data;
}

export async function getVouchers(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Voucher>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Voucher>>>(
    "/accounts/vouchers",
    { params }
  );
  return response.data;
}

export async function createVoucher(
  data: CreateVoucherPayload
): Promise<ApiResponse<Voucher>> {
  const response = await api.post<ApiResponse<Voucher>>(
    "/accounts/vouchers",
    data
  );
  return response.data;
}

export async function deleteVoucher(
  id: string
): Promise<ApiResponse<{ id: string; message: string }>> {
  const response = await api.delete<ApiResponse<{ id: string; message: string }>>(
    `/accounts/vouchers/${id}`
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

export async function exportAccountStatement(
  params?: ListParams
): Promise<void> {
  const { downloadFromApi } = await import("@/lib/download");
  await downloadFromApi("/accounts/statement/export", "account-statement.csv", params);
}
