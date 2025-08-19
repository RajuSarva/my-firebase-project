"use client";

import { useId, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Paperclip, X } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onChange: (file: File | null) => void;
  value: File | null;
  accept?: string;
  className?: string;
  disabled?: boolean;
  buttonIcon?: React.ElementType;
  buttonText?: string;
}

export function FileUpload({
  onChange,
  value,
  accept,
  className,
  disabled,
  buttonIcon: ButtonIcon = Paperclip,
  buttonText = "Optional File Upload"
}: FileUploadProps) {
  const id = useId();
  const [fileName, setFileName] = useState(value?.name || "");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFileName(file?.name || "");
    onChange(file);
  };

  const handleRemoveFile = () => {
    setFileName("");
    onChange(null);
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{buttonText}</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <ButtonIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id={id}
            type="file"
            onChange={handleFileChange}
            accept={accept}
            className="pl-10"
            placeholder="No file selected"
            disabled={disabled}
          />
          {fileName && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">{fileName}</span>
            </div>
          )}
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
