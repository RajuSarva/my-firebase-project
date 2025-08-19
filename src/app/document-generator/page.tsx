
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition, useRef } from "react";
import type { GenerateRefinedDocumentOutput } from "@/ai/flows/document-generator";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { marked } from "marked";

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

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  documentType: z.enum(["BRD", "FRS", "SRS"]),
  file: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DocumentGeneratorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [result, setResult] =
    useState<GenerateRefinedDocumentOutput | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
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
    setHtmlContent("");
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

  const handleDownloadPdf = () => {
    if (!result) return;
  
    const doc = new jsPDF();
    const tokens = marked.lexer(result.markdownContent);
    
    const margin = 15;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = doc.internal.pageSize.width - margin * 2;
    let y = margin;
  
    const checkPageBreak = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const cleanText = (text: string) => {
        // More robust cleaning for various markdown constructs
        return text
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
            .replace(/(\*|_)(.*?)\1/g, '$2')   // Italic
            .replace(/`([^`]+)`/g, '$1')       // Inline code
            .replace(/~~(.*?)~~/g, '$1')       // Strikethrough
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
            .replace(/#/g, '')                 // Hashtags
            .trim();
    };

    const processTokens = (tokens: marked.Token[], listContext: { depth: number, isOrdered: boolean, counter: number } = { depth: 0, isOrdered: false, counter: 1 }) => {
        for (const token of tokens) {
            let textLines: string[];
            const getLineHeight = (fontSize: number) => fontSize * 0.45;

            switch (token.type) {
                case 'heading':
                    const headingSize = 22 - token.depth * 2;
                    checkPageBreak(headingSize * 0.5 + 5);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(headingSize);
                    textLines = doc.splitTextToSize(cleanText(token.text), maxWidth);
                    doc.text(textLines, margin, y);
                    y += textLines.length * getLineHeight(headingSize) + 5;
                    break;
        
                case 'paragraph':
                    checkPageBreak(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(12);
                    
                    // Manually handle bold/italic within paragraphs
                    let currentX = margin;
                    let lineBuffer = '';
                    const parts = token.text.split(/(\*\*|__|\*|_)/g);
                    let isBold = false;
                    let isItalic = false;

                    const renderLineBuffer = () => {
                        if (lineBuffer) {
                            textLines = doc.splitTextToSize(lineBuffer, maxWidth - (currentX - margin));
                            doc.text(textLines, currentX, y);
                            y += textLines.length * getLineHeight(12);
                            currentX = margin;
                            if (textLines.length > 1) {
                                currentX += doc.getStringUnitWidth(textLines[textLines.length - 1]) * 12 / doc.internal.scaleFactor;
                            }
                        }
                        lineBuffer = '';
                    };
                    
                    textLines = doc.splitTextToSize(cleanText(token.text), maxWidth);
                    doc.text(textLines, margin, y, { maxWidth });
                    y += textLines.length * getLineHeight(12) + 4;
                    break;
                    
                case 'list':
                    y += 2;
                    const newListContext = { 
                        depth: listContext.depth + 1, 
                        isOrdered: token.ordered, 
                        counter: token.ordered ? (token.start || 1) : 1 
                    };
                    
                    token.items.forEach(item => {
                        const indent = margin + (newListContext.depth - 1) * 7;
                        const bulletMaxWidth = maxWidth - (indent - margin) - 6;

                        checkPageBreak(8);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(12);
                        
                        let bullet;
                        if (newListContext.isOrdered) {
                            bullet = `${newListContext.counter++}.`;
                        } else {
                            bullet = '•';
                        }
                        
                        const itemContent = item.tokens.map(t => 'text' in t ? t.text : '').join(' ');
                        textLines = doc.splitTextToSize(cleanText(itemContent), bulletMaxWidth);
                        checkPageBreak(textLines.length * getLineHeight(12));
                        
                        doc.text(bullet, indent, y);
                        doc.text(textLines, indent + 5, y);
                        y += textLines.length * getLineHeight(12);

                        // Handle nested lists recursively
                        const nestedList = item.tokens.find(t => t.type === 'list') as marked.Tokens.List | undefined;
                        if (nestedList) {
                            y += 2;
                            processTokens([nestedList], newListContext);
                            y -=2; // remove extra spacing after nested list
                        }
                    });
                    y += 3;
                    break;
        
                case 'space':
                    y += 5;
                    break;
        
                case 'hr':
                    checkPageBreak(10);
                    doc.line(margin, y + 2, doc.internal.pageSize.width - margin, y + 2);
                    y += 7;
                    break;
                    
                case 'table':
                    checkPageBreak(20 + 10 * token.rows.length);
                    autoTable(doc, {
                        head: [token.header.map(h => cleanText(h.text))],
                        body: token.rows.map(row => row.map(cell => cleanText(cell.text))),
                        startY: y,
                        margin: { left: margin, right: margin },
                        styles: {
                            font: 'helvetica',
                            fontSize: 10,
                            cellPadding: 2,
                            overflow: 'linebreak'
                        },
                        headStyles: {
                            fontStyle: 'bold',
                            fillColor: [230, 230, 230],
                            textColor: [20, 20, 20]
                        }
                    });
                    y = (doc as any).lastAutoTable.finalY + 10;
                    break;
                case 'strong':
                case 'em':
                case 'codespan':
                case 'text':
                    // These are handled within paragraph/list processing now.
                    break;
            }
        }
    };
  
    processTokens(tokens);
    doc.save(`${form.getValues("title") || "document"}.pdf`);
  };


  const handleDownloadMd = () => {
    if (!result) return;
    const blob = new Blob([result.markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.getValues("title") || "document"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                          <Input
                            placeholder="e.g., E-commerce Platform"
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
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
                  <div
                    ref={reportRef}
                    className="prose prose-sm dark:prose-invert max-w-none bg-muted p-4 rounded-md overflow-y-auto text-sm max-h-[500px]"
                  >
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownloadPdf}
                    disabled={!result}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download .pdf
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadMd}
                    disabled={!result}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download .md
                  </Button>
                </CardFooter>
              </Card>
            )}

            {!isPending && !result && (
              <Card className="flex flex-col items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Your generated document will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
