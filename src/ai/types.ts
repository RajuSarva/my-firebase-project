
import {z} from 'genkit';

/**
 * @fileOverview
 * This file contains the Zod schemas and TypeScript types for the AI flows.
 * It is used to share types between the server-side flows and the client-side components.
 */

//- Document Generator Types

export const GenerateRefinedDocumentInputSchema = z.object({
    title: z.string().describe('The title of the document.'),
    description: z.string().optional().describe('The description of the document.'),
    documentType: z.enum(['BRD', 'FRS', 'SRS']).describe('The type of the document to generate.'),
    uploadedFile: z
      .string()
      .optional()
      .describe("A file, as a data URI string that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateRefinedDocumentInput = z.infer<typeof GenerateRefinedDocumentInputSchema>;
  
export const GenerateRefinedDocumentOutputSchema = z.object({
    markdownContent: z.string().describe('The generated document content in markdown format.'),
});
export type GenerateRefinedDocumentOutput = z.infer<typeof GenerateRefinedDocumentOutputSchema>;
  
//- Flowchart Generator Types

export const GenerateFlowchartInputSchema = z.object({
    title: z.string().describe('The title of the flowchart.'),
    description: z.string().optional().describe('The description of the process for the flowchart.'),
    uploadedFile: z
      .string()
      .optional()
      .describe(
        "A file, as a data URI string that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
      ),
  });
export type GenerateFlowchartInput = z.infer<typeof GenerateFlowchartInputSchema>;
  
export const GenerateFlowchartOutputSchema = z.object({
    mermaidSyntax: z.string().describe('The flowchart in Mermaid syntax.'),
});
export type GenerateFlowchartOutput = z.infer<typeof GenerateFlowchartOutputSchema>;
  
//- Wireframe Generator Types

export const GenerateWireframesInputSchema = z.object({
    title: z.string().describe('The title of the wireframes to generate.'),
    description: z.string().describe('The detailed description of the wireframes, including functionality and purpose.'),
    wireframeStyle: z.enum(['Sketchy', 'Clean', 'High-Fidelity']).describe('The visual style of the wireframes.'),
    uploadedFile: z
      .string()
      .optional()
      .describe("A file, as a data URI string that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateWireframesInput = z.infer<typeof GenerateWireframesInputSchema>;
  
export const WireframeSchema = z.object({
    screenName: z.string().describe('The name of the screen (e.g., "Homepage", "Login Screen", "User Profile").'),
    description: z.string().describe('A detailed textual description of the wireframe layout, elements, and functionality for this screen.'),
});

export const GenerateWireframesOutputSchema = z.object({
    wireframes: z.array(
      WireframeSchema.extend({
        image: z
          .string()
          .describe(
            "A visual representation of the wireframe as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
          ),
      })
    ).min(6).max(8),
});
export type GenerateWireframesOutput = z.infer<typeof GenerateWireframesOutputSchema>;

    
