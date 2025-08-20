
'use server';
/**
 * @fileOverview Generates a flowchart in Mermaid syntax from a description and an optional file.
 *
 * - generateFlowchart - A function that handles the flowchart generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateFlowchartInputSchema, GenerateFlowchartOutputSchema, type GenerateFlowchartInput, type GenerateFlowchartOutput } from '@/ai/types';


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

  Your response MUST contain only the Mermaid syntax for the flowchart, enclosed in a single markdown code block.
  The text inside the flowchart nodes (e.g., inside brackets) MUST NOT contain any special characters like parentheses, commas, or quotes. Use only alphanumeric characters and spaces.

  For example:
  \`\`\`mermaid
  graph TD
      A[Start] --> B{Is it Friday?};
      B -- Yes --> C[Good];
      B -- No --> D[Work];
      C --> E[End];
      D --> E;
  \`\`\`
  
  Do not include any other text, explanations, or markdown formatting outside of the single "mermaid" code block. The output must be only the code block.`,
});

const generateFlowchartFlow = ai.defineFlow(
  {
    name: 'generateFlowchartFlow',
    inputSchema: GenerateFlowchartInputSchema,
    outputSchema: GenerateFlowchartOutputSchema,
  },
  async (input) => {
    const model = input.uploadedFile ? 'googleai/gemini-1.5-pro-latest' : 'googleai/gemini-1.5-flash-latest';
    
    const llmResponse = await prompt(input, { model });
    const output = llmResponse.output;

    if (!output) {
      throw new Error("Failed to generate flowchart.");
    }
    
    return output;
  }
);

export async function generateFlowchart(input: GenerateFlowchartInput): Promise<GenerateFlowchartOutput> {
    return await generateFlowchartFlow(input);
}

    