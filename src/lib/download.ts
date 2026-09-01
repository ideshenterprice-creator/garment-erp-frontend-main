import api from "@/lib/axios";

export async function downloadFromApi(
  path: string,
  filename: string,
  params?: Record<string, unknown>
): Promise<void> {
  const response = await api.get(path, {
    responseType: "blob",
    params,
  });

  const blob = response.data as Blob;
  const type = blob.type || "";
  if (type.includes("application/json")) {
    const text = await blob.text();
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: { message?: string } };
      throw new Error(parsed.error?.message || parsed.message || "Download failed");
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Download failed");
      }
      throw error;
    }
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
