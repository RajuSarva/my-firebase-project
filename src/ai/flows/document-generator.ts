'use server';
/**
 * @fileOverview A document refinement AI agent.
 *
 * - generateRefinedDocument - A function that handles the document refinement process.
 * - GenerateRefinedDocumentInput - The input type for the generateRefinedDocument function.
 * - GenerateRefinedDocumentOutput - The return type for the generateRefinedDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRefinedDocumentInputSchema = z.object({
  title: z.string().describe('The title of the document.'),
  description: z.string().describe('The description of the document.'),
  documentType: z.enum(['BRD', 'FRS', 'SRS']).describe('The type of the document to generate.'),
  uploadedFile: z
    .string()
    .optional()
    .describe("A file, as a data URI string that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateRefinedDocumentInput = z.infer<typeof GenerateRefinedDocumentInputSchema>;

const GenerateRefinedDocumentOutputSchema = z.object({
  markdownContent: z.string().describe('The generated document content in markdown format.'),
});
export type GenerateRefinedDocumentOutput = z.infer<typeof GenerateRefinedDocumentOutputSchema>;


const refineDocumentPrompt = ai.definePrompt({
  name: 'refineDocumentPrompt',
  input: {schema: GenerateRefinedDocumentInputSchema},
  output: {schema: GenerateRefinedDocumentOutputSchema},
  prompt: `You are a world-class expert in software development and project management documentation. Your task is to generate a comprehensive, detailed, and lengthy document of the specified type. The document must be well-structured, professionally formatted in Markdown, and at least 1500 words long.

Base the document on the following inputs:
- Document Title: {{{title}}}
- Project Description: {{{description}}}
- Document Type: {{{documentType}}}
{{#if uploadedFile}}
- Additional Context from Uploaded File: {{media url=uploadedFile}}
{{/if}}

Adhere strictly to the following structure based on the Document Type:

**If Document Type is "BRD" (Business Requirements Document):**
Generate a complete BRD with the following sections:
1.  **Introduction**:
    *   1.1. Purpose
    *   1.2. Scope
    *   1.3. Business Objectives
    *   1.4. Stakeholders
2.  **Business Process Overview**:
    *   2.1. Current Process (As-Is)
    *   2.2. Proposed Process (To-Be)
    *   2.3. Use Case Diagram
3.  **Functional Requirements**:
    *   3.1. High-Level Features (List and describe each in detail)
    *   3.2. User Stories (Provide at least 10 detailed user stories)
4.  **Non-Functional Requirements**:
    *   4.1. Performance
    *   4.2. Security
    *   4.3. Usability
    *   4.4. Scalability
    *   4.5. Compliance
5.  **Assumptions and Constraints**:
    *   5.1. Business Assumptions
    *   5.2. Technical Constraints
6.  **Success Metrics**:
    *   6.1. Key Performance Indicators (KPIs)
7.  **Glossary**

**If Document Type is "FRS" (Functional Requirements Specification):**
Generate a complete FRS with the following sections:
1.  **Introduction**:
    *   1.1. Purpose
    *   1.2. Scope
    *   1.3. System Overview
    *   1.4. Definitions, Acronyms, and Abbreviations
2.  **Overall Description**:
    *   2.1. Product Perspective
    *   2.2. User Characteristics
    *   2.3. Assumptions and Dependencies
3.  **Specific Requirements**:
    *   3.1. Functional Requirement 1 (e.g., User Authentication)
        *   3.1.1. Description
        *   3.1.2. Inputs
        *   3.1.3. Processing Steps
        *   3.1.4. Outputs
        *   3.1.5. Acceptance Criteria
    *   3.2. Functional Requirement 2 (e.g., Data Management)
        *   ... (continue for all core features)
4.  **Interface Requirements**:
    *   4.1. User Interfaces (UI)
    *   4.2. Hardware Interfaces
    *   4.3. Software Interfaces
5.  **Use Cases**:
    *   5.1. Use Case 1 (Detailed steps, preconditions, postconditions)
    *   5.2. Use Case 2 (and so on)

**If Document Type is "SRS" (Software Requirements Specification):**
Generate a complete SRS based on the IEEE 830 standard with the following sections:
1.  **Introduction**:
    *   1.1. Purpose
    *   1.2. Document Conventions
    *   1.3. Intended Audience
    *   1.4. Product Scope
    *   1.5. References
2.  **Overall Description**:
    *   2.1. Product Perspective
    *   2.2. Product Functions
    *   2.3. User Classes and Characteristics
    *   2.4. Operating Environment
    *   2.5. Design and Implementation Constraints
3.  **System Features**:
    *   3.1. System Feature 1
        *   3.1.1. Description and Priority
        *   3.1.2. Stimulus/Response Sequences
        *   3.1.3. Functional Requirements
    *   3.2. System Feature 2
        *   ... (and so on for all features)
4.  **External Interface Requirements**:
    *   4.1. User Interfaces
    *   4.2. Hardware Interfaces
    *   4.3. Software Interfaces
    *   4.4. Communications Interfaces
5.  **Non-functional Requirements**:
    *   5.1. Performance Requirements
    *   5.2. Safety Requirements
    *   5.3. Security Requirements
    *   5.4. Software Quality Attributes
6.  **Other Requirements** (e.g., Data, Legal, etc.)

Ensure the generated markdown is comprehensive, detailed, well-formatted, and adheres to the requested length. The content must be professional and ready for a real-world project.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
});

const generateRefinedDocumentFlow = ai.defineFlow(
  {
    name: 'generateRefinedDocumentFlow',
    inputSchema: GenerateRefinedDocumentInputSchema,
    outputSchema: GenerateRefinedDocumentOutputSchema,
  },
  async (input) => {
    const model = input.uploadedFile ? 'googleai/gemini-1.5-pro-latest' : 'googleai/gemini-1.5-flash-latest';
    
    const llmResponse = await refineDocumentPrompt(input, { model });
    
    return llmResponse.output!;
  }
);

export const generateRefinedDocument = generateRefinedDocumentFlow;
