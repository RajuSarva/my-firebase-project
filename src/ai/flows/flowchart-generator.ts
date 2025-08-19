// src/ai/flows/flowchart-generator.ts
'use server';
/**
 * @fileOverview Generates a flowchart in Mermaid syntax from a description and an optional file.
 *
 * - generateFlowchart - A function that handles the flowchart generation process.
 * - GenerateFlowchartInput - The input type for the generateFlowchart function.
 * - GenerateFlowchartOutput - The return type for the generateFlowchart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlowchartInputSchema = z.object({
  title: z.string().describe('The title of the flowchart.'),
  description: z.string().describe('The description of the process for the flowchart.'),
  uploadedFile: z
    .string()
    .optional()
    .describe(
      "An optional file (txt, md, pdf) content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' to provide additional context."
    ),
});

export type GenerateFlowchartInput = z.infer<typeof GenerateFlowchartInputSchema>;

const GenerateFlowchartOutputSchema = z.object({
  mermaidSyntax: z.string().describe('The flowchart in Mermaid syntax.'),
});

export type GenerateFlowchartOutput = z.infer<typeof GenerateFlowchartOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateFlowchartPrompt',
  input: {schema: GenerateFlowchartInputSchema},
  output: {schema: GenerateFlowchartOutputSchema},
  prompt: `You are an expert in creating flowcharts using Mermaid syntax.\n\n  Create a flowchart based on the following information:\n\n  Title: {{{title}}}\n  Description: {{{description}}}\n  {{#if uploadedFile}}\n  Additional context from uploaded file: {{media url=uploadedFile}}\n  {{/if}}\n\n  Ensure the flowchart is clear, concise, and accurately represents the process described. Use appropriate Mermaid syntax elements to define the steps, decisions, and connections in the process.\n\n  The flowchart should be returned in Mermaid syntax. Do not include any explanations or other text. ONLY return the Mermaid syntax. Return the full mermaid syntax string. Do not use \`graph LR\` or \`graph TD\`. Instead, use \`mermaid\`.\n  Here is an example:\n  \`\`\`mermaid\n  graph LR\n      A[Start] --> B{Decision}\n      B -- Yes --> C[Process 1]\n      B -- No --> D[Process 2]\n      C --> E[End]\n      D --> E\n  \`\`\``,
  config: {
    model: 'googleai/gemini-2.0-flash',
  }
});

const generateFlowchartFlow = ai.defineFlow(
  {
    name: 'generateFlowchartFlow',
    inputSchema: GenerateFlowchartInputSchema,
    outputSchema: GenerateFlowchartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export const generateFlowchart = generateFlowchartFlow;
