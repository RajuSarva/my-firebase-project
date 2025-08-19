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
      "A file, as a data URI string that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  prompt: `You are an expert in creating flowcharts using Mermaid syntax.

  Create a flowchart based on the following information:

  Title: {{{title}}}
  Description: {{{description}}}
  {{#if uploadedFile}}
  Additional context from uploaded file: {{media url=uploadedFile}}
  {{/if}}

  Ensure the flowchart is clear, concise, and accurately represents the process described. Use appropriate Mermaid syntax elements to define the steps, decisions, and connections in the process.

  The flowchart should be returned in Mermaid syntax. Do not include any explanations or other text. ONLY return the Mermaid syntax inside a "mermaid" code block.
  Here is an example:
  \`\`\`mermaid
  graph LR
      A[Start] --> B{Decision}
      B -- Yes --> C[Process 1]
      B -- No --> D[Process 2]
      C --> E[End]
      D --> E
  \`\`\``,
});

const generateFlowchartFlow = ai.defineFlow(
  {
    name: 'generateFlowchartFlow',
    inputSchema: GenerateFlowchartInputSchema,
    outputSchema: GenerateFlowchartOutputSchema,
  },
  async (input) => {
    const model = input.uploadedFile ? 'googleai/gemini-pro-vision' : 'googleai/gemini-1.5-flash-latest';
    
    const {output} = await prompt(input, { model });
    
    return output!;
  }
);

export const generateFlowchart = generateFlowchartFlow;
