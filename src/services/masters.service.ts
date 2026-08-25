import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  GSTRate,
  KarigarProfile,
  Operation,
  Party,
  Product,
} from "@/types";

export type ListParams = Record<string, string | number | boolean | undefined>;

export async function getParties(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Party>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Party>>>(
    "/masters/parties",
    { params }
  );
  return response.data;
}

export async function getPartyById(id: string): Promise<ApiResponse<Party>> {
  const response = await api.get<ApiResponse<Party>>(
    `/masters/parties/${id}`
  );
  return response.data;
}

export async function createParty(
  data: Partial<Party>
): Promise<ApiResponse<Party>> {
  const response = await api.post<ApiResponse<Party>>(
    "/masters/parties",
    data
  );
  return response.data;
}

export async function updateParty(
  id: string,
  data: Partial<Party>
): Promise<ApiResponse<Party>> {
  const response = await api.put<ApiResponse<Party>>(
    `/masters/parties/${id}`,
    data
  );
  return response.data;
}

export async function togglePartyStatus(
  id: string,
  isActive: boolean
): Promise<ApiResponse<Party>> {
  const response = await api.patch<ApiResponse<Party>>(
    `/masters/parties/${id}/status`,
    { isActive }
  );
  return response.data;
}

export async function getProducts(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Product>>>(
    "/masters/products",
    { params }
  );
  return response.data;
}

export async function getProductById(
  id: string
): Promise<ApiResponse<Product>> {
  const response = await api.get<ApiResponse<Product>>(
    `/masters/products/${id}`
  );
  return response.data;
}

export async function createProduct(
  data: Partial<Product>
): Promise<ApiResponse<Product>> {
  const response = await api.post<ApiResponse<Product>>(
    "/masters/products",
    data
  );
  return response.data;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<ApiResponse<Product>> {
  const response = await api.put<ApiResponse<Product>>(
    `/masters/products/${id}`,
    data
  );
  return response.data;
}

export async function getOperations(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Operation>>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Operation>>>(
    "/masters/operations",
    { params }
  );
  return response.data;
}

export async function createOperation(
  data: Partial<Operation>
): Promise<ApiResponse<Operation>> {
  const response = await api.post<ApiResponse<Operation>>(
    "/masters/operations",
    data
  );
  return response.data;
}

export async function updateOperation(
  id: string,
  data: Partial<Operation>
): Promise<ApiResponse<Operation>> {
  const response = await api.put<ApiResponse<Operation>>(
    `/masters/operations/${id}`,
    data
  );
  return response.data;
}

export async function getGSTRates(): Promise<ApiResponse<GSTRate[]>> {
  const response = await api.get<ApiResponse<GSTRate[]>>("/masters/gst");
  return response.data;
}

export async function createGSTRate(
  data: Partial<GSTRate>
): Promise<ApiResponse<GSTRate>> {
  const response = await api.post<ApiResponse<GSTRate>>("/masters/gst", data);
  return response.data;
}

export async function updateGSTRate(
  id: string,
  data: Partial<GSTRate>
): Promise<ApiResponse<GSTRate>> {
  const response = await api.put<ApiResponse<GSTRate>>(
    `/masters/gst/${id}`,
    data
  );
  return response.data;
}

export async function getKarigars(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<KarigarProfile>>> {
  const response = await api.get<
    ApiResponse<PaginatedResponse<KarigarProfile>>
  >("/masters/karigars", { params });
  return response.data;
}

export async function getKarigarById(
  id: string
): Promise<ApiResponse<KarigarProfile>> {
  const response = await api.get<ApiResponse<KarigarProfile>>(
    `/masters/karigars/${id}`
  );
  return response.data;
}

export async function createKarigar(
  data: Partial<KarigarProfile>
): Promise<ApiResponse<KarigarProfile>> {
  const response = await api.post<ApiResponse<KarigarProfile>>(
    "/masters/karigars",
    data
  );
  return response.data;
}

export async function updateKarigar(
  id: string,
  data: Partial<KarigarProfile>
): Promise<ApiResponse<KarigarProfile>> {
  const response = await api.put<ApiResponse<KarigarProfile>>(
    `/masters/karigars/${id}`,
    data
  );
  return response.data;
}
