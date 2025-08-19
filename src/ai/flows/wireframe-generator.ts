'use server';

/**
 * @fileOverview Generates wireframes based on a title, description, and optional file input.
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
    .describe(
      'Optional: A text file containing hints and specific details to help generate the wireframes. Should be passed as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type GenerateWireframesInput = z.infer<typeof GenerateWireframesInputSchema>;

const GenerateWireframesOutputSchema = z.object({
  homepageWireframeText: z.string().describe('Descriptive text outlining the homepage wireframe.'),
  featureScreenWireframeText: z.string().describe('Descriptive text outlining the key feature screen wireframe.'),
  homepageWireframeImage: z
    .string()
    .describe(
      'A visual representation of the homepage wireframe as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  featureScreenWireframeImage: z
    .string()
    .describe(
      'A visual representation of the key feature screen wireframe as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type GenerateWireframesOutput = z.infer<typeof GenerateWireframesOutputSchema>;

export async function generateWireframes(input: GenerateWireframesInput): Promise<GenerateWireframesOutput> {
  return generateWireframesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWireframesPrompt',
  input: {schema: GenerateWireframesInputSchema},
  output: {schema: z.object({
    homepageWireframeText: z.string().describe('Descriptive text outlining the homepage wireframe.'),
    featureScreenWireframeText: z.string().describe('Descriptive text outlining the key feature screen wireframe.'),
  })},
  prompt: `You are an expert UI/UX designer specializing in generating wireframes for web applications.

You will generate wireframes for two screens:
1.  Homepage: The main landing page of the application.
2.  Key Feature Screen: A screen showcasing a core feature of the application.

Use the following information to generate the wireframes:

Title: {{{title}}}
Description: {{{description}}}

{{#if uploadedFile}}
Uploaded File Content: {{media url=uploadedFile}}
{{/if}}

First, generate descriptive text for both wireframes, detailing the layout, key elements, and functionality of each screen.
`,
  config: {
    model: 'googleai/gemini-2.0-flash',
  }
});

const generateWireframesFlow = ai.defineFlow(
  {
    name: 'generateWireframesFlow',
    inputSchema: GenerateWireframesInputSchema,
    outputSchema: GenerateWireframesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Generate images for the wireframes in parallel with text generation to improve perceived performance
    const [homepageWireframeImage, featureScreenWireframeImage] = await Promise.all([
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a wireframe image for the homepage based on this description: ${output?.homepageWireframeText}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a wireframe image for the key feature screen based on this description: ${output?.featureScreenWireframeText}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);

    return {
      homepageWireframeText: output!.homepageWireframeText,
      featureScreenWireframeText: output!.featureScreenWireframeText,
      homepageWireframeImage: homepageWireframeImage.media!.url,
      featureScreenWireframeImage: featureScreenWireframeImage.media!.url,
    };
  }
);
