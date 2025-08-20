
'use server';

/**
 * @fileOverview Generates multiple, figma-style wireframes based on a title, description, and optional file input.
 *
 * - generateWireframes - A function that generates wireframes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWireframesInputSchema, GenerateWireframesOutputSchema, type GenerateWireframesInput, type GenerateWireframesOutput, WireframeSchema } from '@/ai/types';


const prompt = ai.definePrompt({
  name: 'generateWireframesPrompt',
  input: {schema: GenerateWireframesInputSchema},
  output: {schema: z.object({
      wireframes: z.array(WireframeSchema).min(6).max(8).describe('An array of 6 to 8 key screen wireframe descriptions.')
  })},
  prompt: `You are an expert UI/UX designer specializing in generating wireframes for web and mobile applications.

Your task is to generate detailed textual descriptions for 6 to 8 key screens for an application. You must identify the most important screens based on the provided information.

Use the following information to generate the wireframe descriptions. When a document is uploaded, it is the **primary source of truth**. You must derive the screens and their elements from this document to generate a comprehensive set of wireframes.

Title: {{{title}}}
Description: {{{description}}}

{{#if uploadedFile}}
**Primary Source Document Content:**
{{media url=uploadedFile}}
{{/if}}

For each identified screen, generate a clear name (e.g., "Onboarding Screen") and a detailed description of its layout, key elements, and functionality. This text must be in English.
`,
});

const getStylePrompt = (style: GenerateWireframesInput['wireframeStyle'], description: string) => {
    const basePrompt = `Generate a UI wireframe for a mobile app screen. All text labels must be in English. This wireframe is based on the following description: ${description}`;

    switch (style) {
        case 'Sketchy':
            return `Style: sketchy, hand-drawn, black and white, low-fidelity, with rough lines and basic shapes. ${basePrompt}`;
        case 'High-Fidelity':
            return `Style: high-fidelity, colorful, modern, and detailed. Include icons, refined UI components, and realistic placeholder images. ${basePrompt}`;
        case 'Clean':
        default:
            return `Style: clean, modern, black and white, low-fidelity, Figma-style. Use standard UI components like rectangles for image placeholders, buttons with English labels (e.g., "Sign Up"), and squiggly lines for text. Do NOT include color or detailed graphics. ${basePrompt}`;
    }
}

const generateWireframesFlow = ai.defineFlow(
  {
    name: 'generateWireframesFlow',
    inputSchema: GenerateWireframesInputSchema,
    outputSchema: GenerateWireframesOutputSchema,
  },
  async (input) => {
    const model = input.uploadedFile ? 'googleai/gemini-1.5-pro-latest' : 'googleai/gemini-1.5-flash-latest';
    
    const llmResponse = await prompt(input, { model });
    
    const textOutputs = llmResponse.output?.wireframes;

    if (!textOutputs || textOutputs.length === 0) {
      throw new Error("Failed to generate wireframe text descriptions.");
    }
    
    // Generate all images in parallel.
    const imageGenerationPromises = textOutputs.map(async (wireframe) => {
      const imageResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: getStylePrompt(input.wireframeStyle, wireframe.description),
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      const imageUrl = imageResponse.media?.url;
      if (!imageUrl) {
        throw new Error(`Failed to generate image for screen: ${wireframe.screenName}`);
      }
      return {
        ...wireframe,
        image: imageUrl,
      };
    });

    const finalWireframes = await Promise.all(imageGenerationPromises);

    return {
      wireframes: finalWireframes,
    };
  }
);

export async function generateWireframes(input: GenerateWireframesInput): Promise<GenerateWireframesOutput> {
    return await generateWireframesFlow(input);
}
