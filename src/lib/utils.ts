import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function downloadFile({
  content,
  fileName,
  contentType,
}: {
  content: string;
  fileName: string;
  contentType: string;
}) {
  const a = document.createElement("a");
  const isBase64 = content.startsWith('data:');

  if (isBase64) {
    a.href = content;
  } else {
    const blob = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(blob);
  }
  
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
