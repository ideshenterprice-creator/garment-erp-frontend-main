import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearch(
  q: string,
  limit = 6
): Promise<ApiResponse<{ results: SearchResult[] }>> {
  const response = await api.get<ApiResponse<{ results: SearchResult[] }>>(
    "/search",
    { params: { q, limit } }
  );
  return response.data;
}
