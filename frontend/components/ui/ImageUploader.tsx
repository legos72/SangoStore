"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";

const MAX_MB = 10;
const MAX_FILES = 6;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

interface ImageUploaderProps {
  images: string[];           // URLs (blob: for preview, /uploads/... for saved)
  onFilesChange: (files: (File | null)[], previews: string[]) => void;
  files: (File | null)[];     // parallel array of File objects
  error?: string;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i)) {
    return `"${file.name}" — format non supporté (jpg, png, webp acceptés)`;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return `"${file.name}" dépasse ${MAX_MB} Mo`;
  }
  return null;
}

export function ImageUploader({ images, files, onFilesChange, error }: ImageUploaderProps) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    setFileError(null);
    const arr = Array.from(incoming);
    const remaining = MAX_FILES - images.filter(Boolean).length;
    if (remaining <= 0) { setFileError(`Maximum ${MAX_FILES} images atteint`); return; }

    const toAdd = arr.slice(0, remaining);
    const errors: string[] = [];
    const validFiles: File[] = [];

    for (const f of toAdd) {
      const err = validateFile(f);
      if (err) errors.push(err);
      else validFiles.push(f);
    }

    if (errors.length) { setFileError(errors[0]); }
    if (!validFiles.length) return;

    // Revoke old blobs for empty slots we'll fill
    const newImages = [...images];
    const newFiles  = [...files];

    // Fill existing empty slots first, then append
    for (const vf of validFiles) {
      const emptyIdx = newImages.findIndex(img => !img);
      const preview  = URL.createObjectURL(vf);
      if (emptyIdx !== -1) {
        newImages[emptyIdx] = preview;
        newFiles[emptyIdx]  = vf;
      } else {
        newImages.push(preview);
        newFiles.push(vf);
      }
    }

    onFilesChange(newFiles, newImages);
  }, [images, files, onFilesChange]);

  function removeImage(i: number) {
    const newImages = [...images];
    const newFiles  = [...files];
    if (newImages[i]?.startsWith("blob:")) URL.revokeObjectURL(newImages[i]);
    newImages.splice(i, 1);
    newFiles.splice(i, 1);
    onFilesChange(newFiles, newImages);
    setFileError(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  const hasImages = images.some(Boolean);
  const count     = images.filter(Boolean).length;

  return (
    <div className="space-y-3">

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all py-6 px-4",
          dragging
            ? "border-orange-400 bg-orange-50 scale-[1.01]"
            : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40",
          error && !hasImages ? "border-red-300 bg-red-50/30" : ""
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.heic,.heif"
          className="hidden"
          onChange={e => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ""; } }}
        />
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
          dragging ? "bg-orange-100" : "bg-white border border-gray-200"
        )}>
          <Upload className={cn("w-5 h-5 transition-colors", dragging ? "text-orange-500" : "text-gray-400")} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">
            {dragging ? "Relâchez pour ajouter" : "Glissez vos photos ici"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            ou <span className="text-orange-500 font-semibold">cliquez pour sélectionner</span> — jpg, png, webp · max {MAX_MB} Mo
          </p>
        </div>
        {count > 0 && (
          <span className="absolute top-2.5 right-3 text-[11px] font-bold text-gray-400">
            {count}/{MAX_FILES}
          </span>
        )}
      </div>

      {/* File error */}
      {fileError && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {fileError}
        </div>
      )}

      {/* Preview grid */}
      {hasImages && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {images.map((img, i) =>
            img ? (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={img.startsWith("blob:") ? img : getImageUrl(img)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                >
                  <X className="w-3 h-3" />
                </button>
                {/* Main badge */}
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                    Principale
                  </span>
                )}
              </div>
            ) : null
          )}
        </div>
      )}

      {!hasImages && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ImageIcon className="w-3.5 h-3.5" />
          La première photo sera l'image principale du produit
        </div>
      )}

      {error && !hasImages && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
