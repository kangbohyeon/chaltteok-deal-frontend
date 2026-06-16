import { useCallback, useEffect, useState } from "react";
import { uploadFile } from "@/api/user";

interface FilePreview {
  file: File;
  previewUrl: string;
}

export function useFileAttachment(maxCount = 3) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (files: File[]) => {
      if (previews.length + files.length > maxCount) {
        setError(`이미지는 최대 ${maxCount}장까지 첨부 가능합니다.`);
        return;
      }
      setError(null);
      const newPreviews = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [previews.length, maxCount]
  );

  const removeFile = useCallback((index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const uploadAll = useCallback(async (): Promise<string[]> => {
    if (previews.length === 0) return [];
    const results = await Promise.all(previews.map((p) => uploadFile(p.file)));
    return results.map((r) => r.attachmentUuid);
  }, [previews]);

  const reset = useCallback(() => {
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // cleanup only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { previews, error, addFiles, removeFile, uploadAll, reset };
}
