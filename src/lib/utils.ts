import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
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
  if (!isBase64) {
    URL.revokeObjectURL(a.href);
  }
}
