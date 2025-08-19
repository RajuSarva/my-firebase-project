
'use server';

/**
 * @fileOverview Generates multiple, figma-style wireframes based on a title, description, and optional file input.
 *
 * - generateWireframes - A function that generates wireframes.
 * - GenerateWireframesInput - The input type for the generateWireframes function.
 * - GenerateWireframesOutput - The return type for the generateWireframes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWireframesInputSchema = z.object({
  title: z.string().describe('The title of the wireframes to generate.'),
  description: z.string().describe('The detailed description of the wireframes, including functionality and purpose.'),
  uploadedFile: z
    .string()
    .optional()
    .describe("A file, as a data URI string that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type GenerateWireframesInput = z.infer<typeof GenerateWireframesInputSchema>;

const WireframeSchema = z.object({
  screenName: z.string().describe('The name of the screen (e.g., "Homepage", "Login Screen", "User Profile").'),
  description: z.string().describe('A detailed textual description of the wireframe layout, elements, and functionality for this screen.'),
});

const GenerateWireframesOutputSchema = z.object({
  wireframes: z.array(
    WireframeSchema.extend({
      image: z
        .string()
        .describe(
          "A visual representation of the wireframe as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    })
  ),
});

export type GenerateWireframesOutput = z.infer<typeof GenerateWireframesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateWireframesPrompt',
  input: {schema: GenerateWireframesInputSchema},
  output: {schema: z.object({
      wireframes: z.array(WireframeSchema).min(4).max(5).describe('An array of 4 to 5 key screen wireframe descriptions.')
  })},
  prompt: `You are an expert UI/UX designer specializing in generating wireframes for web and mobile applications.

Your task is to generate detailed textual descriptions for 4 to 5 key screens for an application. You must identify the most important screens based on the provided information.

Use the following information to generate the wireframe descriptions. If an FRS or other document is uploaded, it should be the **primary source of information** for identifying the screens and their required elements.

Title: {{{title}}}
Description: {{{description}}}

{{#if uploadedFile}}
**Primary Source Document Content:**
{{media url=uploadedFile}}
{{/if}}

For each identified screen, generate a clear name (e.g., "Onboarding Screen") and a detailed description of its layout, key elements, and functionality. This text must be in English.
`,
});

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

    const wireframeImagePrompt = (description: string) => `Generate a clean, black and white, low-fidelity UI wireframe for a mobile app screen, in the style of a modern Figma design. The wireframe MUST be schematic and professional, using standard UI components like rectangles for image placeholders, buttons with English labels (e.g., "Sign Up", "Learn More"), and squiggly or dummy lorem ipsum lines for text blocks. All text labels or annotations MUST be in English. Do NOT include any color, detailed graphics, or realistic photos. The output must look like a professional, early-stage design mockup created in a tool like Figma. The wireframe should be based on this description: ${description}`;

    // Generate all images in parallel.
    const imageGenerationPromises = textOutputs.map(async (wireframe) => {
      const imageResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: wireframeImagePrompt(wireframe.description),
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

export const generateWireframes = generateWireframesFlow;
