
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition, useRef } from "react";
import type { GenerateRefinedDocumentOutput } from "@/ai/flows/document-generator";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { marked, Lexer } from "marked";


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
import { Download } from "lucide-react";
import { STATIC_LOGO_BASE64 } from "@/lib/logo";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  documentType: z.enum(["BRD", "FRS", "SRS"]),
  file: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DocumentGeneratorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [result, setResult] = useState<GenerateRefinedDocumentOutput | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      documentType: "BRD",
      file: null,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    setHtmlContent('');
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
        const html = await marked(response.data.markdownContent);
        setHtmlContent(html);
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
    if (!result?.markdownContent) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    const logoImg = new Image();
    logoImg.src = STATIC_LOGO_BASE64;
    
    const logoWidth = 75;
    const img = new Image();
    img.src = STATIC_LOGO_BASE64;
    const logoHeight = (img.height * logoWidth) / img.width;

    const addPageContent = (docInstance: jsPDF, pageNumber: number) => {
      docInstance.setPage(pageNumber);
      docInstance.addImage(logoImg, 'PNG', margin, 20, logoWidth, logoHeight);
      docInstance.line(margin, 20 + logoHeight + 10, pdfWidth - margin, 20 + logoHeight + 10);
      
      docInstance.saveGraphicsState();
      docInstance.setGState(new (doc as any).GState({opacity: 0.1}));
      docInstance.addImage(logoImg, 'PNG', pdfWidth / 2 - 100, doc.internal.pageSize.getHeight() / 2 - 50, 200, (200 * img.height) / img.width);
      docInstance.restoreGraphicsState();
    };

    addPageContent(doc, 1);

    const tokens = new Lexer().lex(result.markdownContent);
    const body: any[] = [];

    const processTokens = (tokensToProcess: marked.Token[], depth = 0) => {
      tokensToProcess.forEach(token => {
        switch (token.type) {
          case 'heading':
            let fontSize = 12;
            let fontStyle: 'bold' | 'normal' = 'bold';
            if (token.depth === 1) fontSize = 18;
            if (token.depth === 2) fontSize = 16;
            if (token.depth >= 3) fontSize = 14;
            body.push({ content: token.text, styles: { fontStyle, fontSize } });
            break;
          case 'paragraph':
            body.push({ content: token.text, styles: { fontSize: 12 } });
            break;
          case 'list':
            token.items.forEach((item) => {
              if (item.type === 'list_item') {
                const bullet = '•';
                const itemText = item.tokens.map(t => 'text' in t ? t.text : '').join('');
                const content = `${bullet} ${itemText}`;
                
                body.push({
                  content: content,
                  styles: { fontSize: 12, cellPadding: { left: 10 + depth * 15 } }
                });

                const nestedList = item.tokens.find(t => t.type === 'list') as marked.Tokens.List;
                if (nestedList) {
                  processTokens(nestedList.items, depth + 1);
                }
              }
            });
            break;
          case 'space':
            body.push({ content: '', styles: { fontSize: 6 } });
            break;
          case 'text':
            if (token.text.trim()) {
              body.push({ content: token.text, styles: { fontSize: 12 } });
            }
            break;
        }
      });
    };

    processTokens(tokens);

    autoTable(doc, {
        startY: 20 + logoHeight + 20,
        body: body,
        theme: 'plain',
        styles: {
            font: 'helvetica',
            overflow: 'linebreak',
            cellPadding: 2,
            fontSize: 12,
        },
        columnStyles: {
            0: { cellWidth: pdfWidth - margin * 2 },
        },
        didDrawPage: (data) => {
            addPageContent(doc, data.pageNumber);
        },
        margin: { top: 20 + logoHeight + 20, bottom: 40 }
    });

    doc.save(`${form.getValues('title') || 'document'}.pdf`);
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
                            </Trigger>
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
                   <div className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md overflow-y-auto text-sm max-h-[500px]">
                      <div ref={reportRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadPdf} disabled={!htmlContent}>
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

    