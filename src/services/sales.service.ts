import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateSalesBillPayload,
  CreateSalesNotePayload,
  RecordSalesPaymentPayload,
  SalesBill,
  SalesBillsListResponse,
  SalesNote,
  SalesRegisterResponse,
} from "@/types";
import type { ListParams } from "@/services/masters.service";

export async function getSalesBills(
  params?: ListParams
): Promise<ApiResponse<SalesBillsListResponse>> {
  const response = await api.get<ApiResponse<SalesBillsListResponse>>(
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
  data: CreateSalesBillPayload
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
  data: RecordSalesPaymentPayload
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
): Promise<ApiResponse<SalesRegisterResponse>> {
  const response = await api.get<ApiResponse<SalesRegisterResponse>>(
    "/sales/register",
    { params }
  );
  return response.data;
}

export async function exportSalesRegister(
  params?: ListParams
): Promise<void> {
  const { downloadFromApi } = await import("@/lib/download");
  await downloadFromApi("/sales/register/export", "sales-register.csv", params);
}

export async function downloadSalesBillPdf(id: string, invoiceNumber: string): Promise<void> {
  const { downloadFromApi } = await import("@/lib/download");
  await downloadFromApi(`/sales/bills/${id}/pdf`, `${invoiceNumber}.pdf`);
}

export async function getNotes(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<SalesNote>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<SalesNote>>>(
    "/sales/notes",
    { params }
  );
  return response.data;
}

export async function createNote(
  data: CreateSalesNotePayload
): Promise<ApiResponse<SalesNote>> {
  const response = await api.post<ApiResponse<SalesNote>>(
    "/sales/notes",
    data
  );
  return response.data;
}
