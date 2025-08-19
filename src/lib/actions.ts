
"use server";

import { generateRefinedDocument } from "@/ai/flows/document-generator";
import { generateFlowchart } from "@/ai/flows/flowchart-generator";
import { generateWireframes } from "@/ai/flows/wireframe-generator";
import { z } from "zod";
import { fileToBase64 } from "./utils";

const fileSchema = z.any().optional();

// Document Generator Action
const docSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  documentType: z.enum(["BRD", "FRS", "SRS"]),
  file: fileSchema,
});
export async function handleDocumentGeneration(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = docSchema.parse(data);

    let uploadedFile: string | undefined = undefined;
    if (parsed.file && parsed.file.size > 0) {
      uploadedFile = await fileToBase64(parsed.file);
    }
    
    const result = await generateRefinedDocument({
      title: parsed.title,
      description: parsed.description,
      documentType: parsed.documentType,
      uploadedFile,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to generate document. ${errorMessage}` };
  }
}

// Flowchart Generator Action
const flowchartSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  file: fileSchema,
});
export async function handleFlowchartGeneration(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = flowchartSchema.parse(data);

    let uploadedFile: string | undefined = undefined;
    if (parsed.file && parsed.file.size > 0) {
      uploadedFile = await fileToBase64(parsed.file);
    }
    
    const result = await generateFlowchart({
      title: parsed.title,
      description: parsed.description,
      uploadedFile,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to generate flowchart. ${errorMessage}` };
  }
}

// Wireframe Generator Action
const wireframeSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  wireframeStyle: z.enum(['Sketchy', 'Clean', 'High-Fidelity']),
  file: fileSchema,
});
export async function handleWireframeGeneration(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const parsed = wireframeSchema.parse(data);

    let uploadedFile: string | undefined = undefined;
    if (parsed.file && parsed.file.size > 0) {
      uploadedFile = await fileToBase64(parsed.file);
    }

    const result = await generateWireframes({
      title: parsed.title,
      description: parsed.description,
      wireframeStyle: parsed.wireframeStyle,
      uploadedFile,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to generate wireframes. ${errorMessage}` };
  }
}
