"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition, useRef } from "react";
import type { GenerateRefinedDocumentOutput } from "@/ai/flows/document-generator";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { handleDocumentGeneration } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Download, FileImage } from "lucide-react";
import { fileToBase64 } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  documentType: z.enum(["BRD", "FRS", "SRS"]),
  file: z.instanceof(File).nullable(),
  logo: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DocumentGeneratorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [result, setResult] = useState<GenerateRefinedDocumentOutput | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      documentType: "BRD",
      file: null,
      logo: null,
    },
  });

  const handleLogoChange = async (file: File | null) => {
      if (file) {
        const base64 = await fileToBase64(file);
        setLogoBase64(base64);
        form.setValue("logo", file);
      } else {
        setLogoBase64(null);
        form.setValue("logo", null);
      }
    };

  const onSubmit = (values: FormValues) => {
    setResult(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("documentType", values.documentType);
      if (values.file) {
        formData.append("file", values.file);
      }

      const response = await handleDocumentGeneration(formData);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: response.error,
        });
      }
    });
  };

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) return;

    // Temporarily make all content visible for capturing
    const report = input.cloneNode(true) as HTMLElement;
    document.body.appendChild(report);

    const canvas = await html2canvas(report, {
        scale: 2,
        useCORS: true,
    });
    
    document.body.removeChild(report);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const width = pdfWidth;
    const height = width / ratio;

    let position = 0;
    let heightLeft = height;

    if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', 15, 10, 30, 15);
    }
    pdf.addImage(imgData, 'PNG', 0, position + (logoBase64 ? 30: 15), width, height);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pdfHeight;
    }

    pdf.save("document.pdf");
  };

  return (
    <DashboardLayout>
      <main className="p-4 md:p-8 grid gap-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">Document Generator</h1>
          <p className="text-muted-foreground">
            Create professional project documents in minutes.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>
                Provide the details for your document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., E-commerce Platform" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the project, its goals, and key features..."
                            className="resize-none"
                            rows={5}
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BRD">
                              Business Requirements Document (BRD)
                            </SelectItem>
                            <SelectItem value="FRS">
                              Functional Requirements Specification (FRS)
                            </SelectItem>
                            <SelectItem value="SRS">
                              Software Requirements Specification (SRS)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                       <FormItem>
                        <FormControl>
                          <FileUpload
                            value={field.value}
                            onChange={field.onChange}
                            accept=".txt,.md,.pdf"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a file (txt, md, pdf) for additional context.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Logo</FormLabel>
                        <FormControl>
                          <FileUpload
                            value={field.value}
                            onChange={handleLogoChange}
                            accept="image/png, image/jpeg"
                            disabled={isPending}
                            buttonIcon={FileImage}
                            buttonText="Upload Logo"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Upload a logo for the PDF header.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Generating..." : "Generate Document"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
             {isPending && (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                  <CardFooter>
                     <Skeleton className="h-10 w-32" />
                  </CardFooter>
                </Card>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Document</CardTitle>
                </CardHeader>
                <CardContent>
                   <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md overflow-x-auto text-sm max-h-[400px]">
                      <pre className="whitespace-pre-wrap font-sans">{result.markdownContent}</pre>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadPdf}>
                    <Download className="mr-2" />
                    Download .pdf
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {!isPending && !result && (
              <Card className="flex flex-col items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                      <p className="text-muted-foreground">Your generated document will appear here.</p>
                  </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
