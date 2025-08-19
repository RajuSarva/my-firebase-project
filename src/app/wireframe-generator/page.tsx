
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import type { GenerateWireframesOutput } from "@/ai/flows/wireframe-generator";

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
import { FileUpload } from "@/components/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { handleWireframeGeneration } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText } from "lucide-react";
import Image from "next/image";
import { downloadFile } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  wireframeStyle: z.enum(['Sketchy', 'Clean', 'High-Fidelity']),
  file: z.instanceof(File).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WireframeGeneratorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [result, setResult] = useState<GenerateWireframesOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      wireframeStyle: "Clean",
      file: null,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("wireframeStyle", values.wireframeStyle);
      if (values.file) {
        formData.append("file", values.file);
      }

      const response = await handleWireframeGeneration(formData);
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

  const renderResultCard = (title: string, text: string, image: string, index: number) => (
     <Card key={index}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <Image src={image} alt={`${title} wireframe`} layout="fill" objectFit="contain" />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => downloadFile({ content: text, fileName: `${title.replace(/\s+/g, '_').toLowerCase()}_${index}_desc.txt`, contentType: 'text/plain' })}>
          <FileText className="mr-2 h-4 w-4" /> Text
        </Button>
        <Button variant="outline" size="sm" onClick={() => downloadFile({ content: image, fileName: `${title.replace(/\s+/g, '_').toLowerCase()}_${index}_wireframe.png`, contentType: 'image/png' })}>
          <Download className="mr-2 h-4 w-4" /> Image
        </Button>
      </CardFooter>
    </Card>
  )

  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
      <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-4 w-1/4 mb-2" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  )

  return (
    <DashboardLayout>
      <main className="p-4 md:p-8 grid gap-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">Wireframe Generator</h1>
          <p className="text-muted-foreground">
            Bring your ideas to life with AI-generated wireframes.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1 sticky top-4">
            <CardHeader>
              <CardTitle>Wireframe Details</CardTitle>
              <CardDescription>
                Provide the details for your application screens.
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
                        <FormLabel>Application/Feature Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Photo Sharing App" {...field} disabled={isPending} />
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
                            placeholder="Describe the application's purpose, target audience, and key user interactions..."
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
                   <FormField
                    control={form.control}
                    name="wireframeStyle"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Wireframe Style</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            disabled={isPending}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Clean" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Clean & Modern (Figma-style)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Sketchy" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Sketchy
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="High-Fidelity" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                High-Fidelity
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
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
                          Upload an FRS or other doc for layout hints.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Generating..." : "Generate Wireframes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            {isPending && (
              Array.from({ length: 4 }).map((_, index) => renderSkeletonCard(index))
            )}

            {result && result.wireframes.map((wireframe, index) => 
                renderResultCard(wireframe.screenName, wireframe.description, wireframe.image, index)
            )}
            
            {!isPending && !result && (
              <Card className="md:col-span-2 flex flex-col items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                      <p className="text-muted-foreground">Your generated wireframes will appear here.</p>
                  </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
