
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

  Your response MUST be a JSON object with a single key "mermaidSyntax" containing the Mermaid syntax for the flowchart.
  The text inside the flowchart nodes (e.g., inside brackets) MUST NOT contain any special characters like parentheses, commas, or quotes. Use only alphanumeric characters and spaces.

  For example:
  {
    "mermaidSyntax": "graph TD\\n    A[Start] --> B{Is it Friday?};\\n    B -- Yes --> C[Good];\\n    B -- No --> D[Work];\\n    C --> E[End];\\n    D --> E;"
  }
  
  Do not include any other text, explanations, or markdown formatting. The output must be only the JSON object.`,
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

    if (!output || !output.mermaidSyntax) {
      throw new Error("Failed to generate flowchart or the output was empty.");
    }
    
    return output;
  }
);

export async function generateFlowchart(input: GenerateFlowchartInput): Promise<GenerateFlowchartOutput> {
    return await generateFlowchartFlow(input);
}

    