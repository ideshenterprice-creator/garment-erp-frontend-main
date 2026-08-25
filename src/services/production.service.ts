import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Bundle,
  BundleJourney,
  BundlePaymentsResponse,
  BundleSummary,
  ColoringEntry,
  ColoringListSummary,
  CreateColoringPayload,
  CreateCuttingPayload,
  CreateFinishingPayload,
  CreatePrintingPayload,
  CreateStitchingPayload,
  CuttingEntry,
  CuttingListSummary,
  FinishingEntry,
  FinishingListSummary,
  PrintingEntry,
  PrintingListSummary,
  ProductionCreateResult,
  StitchingEntry,
  StitchingListSummary,
} from "@/types";
import type { ListParams } from "@/services/masters.service";

type ListWithSummary<T, S> = PaginatedResponse<T> & { summary: S };

export async function getCuttingEntries(
  params?: ListParams
): Promise<ApiResponse<ListWithSummary<CuttingEntry, CuttingListSummary>>> {
  const response = await api.get<
    ApiResponse<ListWithSummary<CuttingEntry, CuttingListSummary>>
  >("/production/cutting", { params });
  return response.data;
}

export async function createCuttingEntry(
  data: CreateCuttingPayload
): Promise<ApiResponse<ProductionCreateResult<CuttingEntry>>> {
  const response = await api.post<
    ApiResponse<ProductionCreateResult<CuttingEntry>>
  >("/production/cutting", data);
  return response.data;
}

export async function getPrintingEntries(
  params?: ListParams
): Promise<ApiResponse<ListWithSummary<PrintingEntry, PrintingListSummary>>> {
  const response = await api.get<
    ApiResponse<ListWithSummary<PrintingEntry, PrintingListSummary>>
  >("/production/printing", { params });
  return response.data;
}

export async function createPrintingEntry(
  data: CreatePrintingPayload
): Promise<ApiResponse<ProductionCreateResult<PrintingEntry>>> {
  const response = await api.post<
    ApiResponse<ProductionCreateResult<PrintingEntry>>
  >("/production/printing", data);
  return response.data;
}

export async function getColoringEntries(
  params?: ListParams
): Promise<ApiResponse<ListWithSummary<ColoringEntry, ColoringListSummary>>> {
  const response = await api.get<
    ApiResponse<ListWithSummary<ColoringEntry, ColoringListSummary>>
  >("/production/coloring", { params });
  return response.data;
}

export async function createColoringEntry(
  data: CreateColoringPayload
): Promise<ApiResponse<ProductionCreateResult<ColoringEntry>>> {
  const response = await api.post<
    ApiResponse<ProductionCreateResult<ColoringEntry>>
  >("/production/coloring", data);
  return response.data;
}

export async function getStitchingEntries(
  params?: ListParams
): Promise<ApiResponse<ListWithSummary<StitchingEntry, StitchingListSummary>>> {
  const response = await api.get<
    ApiResponse<ListWithSummary<StitchingEntry, StitchingListSummary>>
  >("/production/stitching", { params });
  return response.data;
}

export async function createStitchingEntry(
  data: CreateStitchingPayload
): Promise<ApiResponse<ProductionCreateResult<StitchingEntry>>> {
  const response = await api.post<
    ApiResponse<ProductionCreateResult<StitchingEntry>>
  >("/production/stitching", data);
  return response.data;
}

export async function getFinishingEntries(
  params?: ListParams
): Promise<ApiResponse<ListWithSummary<FinishingEntry, FinishingListSummary>>> {
  const response = await api.get<
    ApiResponse<ListWithSummary<FinishingEntry, FinishingListSummary>>
  >("/production/finishing", { params });
  return response.data;
}

export async function createFinishingEntry(
  data: CreateFinishingPayload
): Promise<ApiResponse<ProductionCreateResult<FinishingEntry>>> {
  const response = await api.post<
    ApiResponse<ProductionCreateResult<FinishingEntry>>
  >("/production/finishing", data);
  return response.data;
}

export async function getBundles(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Bundle>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Bundle>>>(
    "/production/bundles",
    { params }
  );
  return response.data;
}

export async function getBundleByNumber(
  bundleNumber: string
): Promise<ApiResponse<BundleSummary>> {
  const response = await api.get<ApiResponse<BundleSummary>>(
    `/production/bundles/${encodeURIComponent(bundleNumber)}`
  );
  return response.data;
}

export async function getBundleJourney(
  bundleNumber: string
): Promise<ApiResponse<BundleJourney>> {
  const response = await api.get<ApiResponse<BundleJourney>>(
    `/production/bundles/${encodeURIComponent(bundleNumber)}/journey`
  );
  return response.data;
}

export async function getBundlePayments(
  bundleNumber: string
): Promise<ApiResponse<BundlePaymentsResponse>> {
  const response = await api.get<ApiResponse<BundlePaymentsResponse>>(
    `/production/bundles/${encodeURIComponent(bundleNumber)}/payments`
  );
  return response.data;
}
