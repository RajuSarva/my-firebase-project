
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import type { GenerateFlowchartOutput } from "@/ai/types";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { FileUpload } from "@/components/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { handleFlowchartGeneration } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { MermaidPreview } from "@/components/mermaid-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchemaDescription = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  file: z.null(),
});

const formSchemaFile = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.null(),
    file: z.instanceof(File, { message: "A file is required." }),
});

type FormValues = z.infer<typeof formSchemaDescription> | z.infer<typeof formSchemaFile>;

export default function FlowchartGeneratorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [result, setResult] = useState<GenerateFlowchartOutput | null>(null);
  const [chartTitle, setChartTitle] = useState<string>("");
  const [activeTab, setActiveTab] = useState("description");

  const formDescription = useForm<z.infer<typeof formSchemaDescription>>({
    resolver: zodResolver(formSchemaDescription),
    defaultValues: {
      title: "",
      description: "",
      file: null,
    },
  });

  const formFile = useForm<z.infer<typeof formSchemaFile>>({
    resolver: zodResolver(formSchemaFile),
    defaultValues: {
      title: "",
      description: null,
      file: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    setChartTitle(values.title);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.description) {
        formData.append("description", values.description);
      }
      if (values.file) {
        formData.append("file", values.file);
      }
      
      const response = await handleFlowchartGeneration(formData);
      if (response.success && response.data) {
        const mermaidSyntax = response.data.mermaidSyntax?.trim();
        if (mermaidSyntax) {
            setResult({ mermaidSyntax });
        } else {
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: "The AI returned an invalid or empty flowchart format.",
            });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: response.error,
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <main className="p-4 md:p-8 grid gap-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">Flowchart Generator</h1>
          <p className="text-muted-foreground">
            Visualize your processes with AI-generated diagrams.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Flowchart Details</CardTitle>
              <CardDescription>
                Describe the process or upload a document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">From Description</TabsTrigger>
                  <TabsTrigger value="document">From Document</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                    <Form {...formDescription}>
                        <form
                        onSubmit={formDescription.handleSubmit(onSubmit)}
                        className="space-y-6 pt-4"
                        >
                        <FormField
                            control={formDescription.control}
                            name="title"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., User Login Flow" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={formDescription.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Process Description</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Describe the steps, decisions, and outcomes of the process..."
                                    className="resize-none"
                                    rows={8}
                                    {...field}
                                    disabled={isPending}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? "Generating..." : "Generate Flowchart"}
                        </Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="document">
                    <Form {...formFile}>
                        <form
                        onSubmit={formFile.handleSubmit(onSubmit)}
                        className="space-y-6 pt-4"
                        >
                         <FormField
                            control={formFile.control}
                            name="title"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., System Authentication Flow" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={formFile.control}
                            name="file"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <FileUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    accept=".txt,.md,.pdf"
                                    disabled={isPending}
                                    buttonText="Upload Document"
                                />
                                </FormControl>
                                <FormDescription>
                                Upload a document to generate a flowchart from.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? "Generating..." : "Generate Flowchart"}
                        </Button>
                        </form>
                    </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2">
            {isPending && (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[400px]">
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            )}

            {!isPending && (
              <MermaidPreview title={chartTitle} chart={result?.mermaidSyntax ?? ''} />
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
