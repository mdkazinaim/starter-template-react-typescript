import { useState, useEffect, useCallback } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: File | File[] | null;
  onChange: (val: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
  error?: boolean;
  className?: string;
}

export const FileUpload = ({
  value,
  onChange,
  accept,
  multiple = false,
  error,
  className,
}: FileUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!value) {
      setPreviews([]);
      return;
    }

    const files = Array.isArray(value) ? value : [value];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push("file"); // Placeholder for non-image files
        if (newPreviews.length === files.length) {
          setPreviews([...newPreviews]);
        }
      }
    });
  }, [value]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        if (multiple) {
          onChange(files);
        } else {
          onChange(files[0]);
        }
      }
    },
    [multiple, onChange]
  );

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      if (multiple) {
        onChange(files);
      } else {
        onChange(files[0]);
      }
    }
  };

  const removeFile = (index: number) => {
    if (!value) return;
    if (Array.isArray(value)) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange(null);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 group cursor-pointer",
          "hover:border-primary-background/50 hover:bg-primary-background/5",
          error ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <Upload className="h-6 w-6 text-primary-background" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">Click or drag to upload</p>
            <p className="text-xs text-gray-400 mt-1">
              {accept ? `Supports: ${accept}` : "All file types supported"}
            </p>
          </div>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
              {preview === "file" ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FileIcon className="h-8 w-8 text-gray-400" />
                </div>
              ) : (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
