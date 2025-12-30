import { useState, useRef, useCallback, type DragEvent } from 'react';

export interface ImagePreview {
  file: File;
  url: string;
}

export interface UseImageAttachmentReturn {
  images: ImagePreview[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageAdd: (files: FileList | null) => void;
  handleImageRemove: (index: number) => void;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  clearImages: () => void;
}

export const useImageAttachment = (): UseImageAttachmentReturn => {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImagePreview[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          url: URL.createObjectURL(file),
        });
      }
    }
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleImageRemove = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleImageAdd(e.dataTransfer.files);
    },
    [handleImageAdd],
  );

  const clearImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
  }, [images]);

  return {
    images,
    isDragging,
    fileInputRef,
    handleImageAdd,
    handleImageRemove,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearImages,
  };
}
