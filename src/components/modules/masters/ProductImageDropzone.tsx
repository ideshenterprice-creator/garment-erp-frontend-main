"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const PRODUCT_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function extensionOf(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function validateProductImage(file: File): string | null {
  const ext = extensionOf(file.name);
  if (ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif") {
    return "iPhone HEIC photos are not supported. Export or save the photo as JPEG, PNG, or WebP.";
  }
  const hasAllowedType = PRODUCT_IMAGE_TYPES.has(file.type);
  const hasAllowedExt = ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
  if (!hasAllowedType && !hasAllowedExt) {
    return "Use a JPEG, PNG, or WebP image.";
  }
  if (file.size <= 0) {
    return "The selected file is empty.";
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

interface ProductImageDropzoneProps {
  previewUrl: string | null;
  disabled?: boolean;
  error?: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

export function ProductImageDropzone({
  previewUrl,
  disabled = false,
  error,
  onFileSelected,
  onRemove,
}: ProductImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    onFileSelected(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={previewUrl ? "Change product image" : "Upload product image"}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (disabled) return;
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed bg-slate-50 text-slate-500 transition-colors",
          dragActive
            ? "border-[#1b3a3a] bg-[#1b3a3a]/5"
            : "border-slate-300 hover:border-[#1b3a3a]/60 hover:bg-slate-100",
          disabled && "pointer-events-none opacity-60",
          error && "border-red-400"
        )}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Product preview"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-black/10 to-transparent p-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-800">
                <ImagePlus className="size-3.5" />
                Change image
              </span>
              <button
                type="button"
                aria-label="Remove product image"
                className="rounded-md bg-white/90 p-1 text-slate-700 hover:bg-white hover:text-red-600"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!disabled) onRemove();
                }}
              >
                <X className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Camera className="mb-2 size-6" />
            <p className="text-sm font-medium">Upload Product Image</p>
            <p className="mt-1 text-xs text-slate-400">
              Click or drag · JPEG, PNG, WebP · max 5MB
            </p>
          </>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
