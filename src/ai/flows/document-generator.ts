
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
  prompt: `You are a world-class expert in software development and project management documentation. Your task is to generate an exceptionally comprehensive, extremely detailed, and very lengthy document of the specified type. The document must be well-structured, professionally formatted in Markdown, and exceed 2000 words.

Base the document on the following inputs:
- Document Title: {{{title}}}
- Project Description: {{{description}}}
- Document Type: {{{documentType}}}
{{#if uploadedFile}}
- Additional Context from Uploaded File: {{media url=uploadedFile}}
{{/if}}

Adhere strictly to the following structure based on the Document Type, ensuring every section is flushed out with substantial detail and examples.

**If Document Type is "BRD" (Business Requirements Document):**
Generate a complete BRD with the following sections, making sure each subsection is elaborate:
1.  **Introduction**:
    *   1.1. Purpose (Clearly state the business problem and the document's objective.)
    *   1.2. Scope (Detail what is in and out of scope for the project.)
    *   1.3. Business Objectives (List specific, measurable, achievable, relevant, and time-bound (SMART) goals.)
    *   1.4. Stakeholders (List all key stakeholders and their roles/responsibilities.)
2.  **Business Process Overview**:
    *   2.1. Current Process (As-Is) (Provide a detailed narrative and diagram of the existing workflow.)
    *   2.2. Proposed Process (To-Be) (Provide a detailed narrative and diagram of the new, improved workflow.)
    *   2.3. Use Case Diagram (A comprehensive diagram showing actor interactions with the system.)
3.  **Functional Requirements**:
    *   3.1. High-Level Features (List and describe each major feature in exhaustive detail.)
    *   3.2. User Stories (Provide at least 15-20 detailed user stories with acceptance criteria for each.)
4.  **Non-Functional Requirements**:
    *   4.1. Performance (e.g., response times, concurrent users.)
    *   4.2. Security (e.g., data encryption, access control.)
    *   4.3. Usability (e.g., accessibility standards, user interface guidelines.)
    *   4.4. Scalability (e.g., expected growth in users/data.)
    *   4.5. Compliance (e.g., GDPR, HIPAA.)
5.  **Assumptions and Constraints**:
    *   5.1. Business Assumptions
    *   5.2. Technical Constraints
6.  **Success Metrics**:
    *   6.1. Key Performance Indicators (KPIs) (Define how success will be measured.)
7.  **Glossary** (Define all key terms used in the document.)

**If Document Type is "FRS" (Functional Requirements Specification):**
Generate a complete and exhaustive FRS. This document needs to be extremely detailed, breaking down every function into minute steps.
1.  **Introduction**:
    *   1.1. Purpose (What is this document for?)
    *   1.2. Scope (What system/features does this document cover?)
    *   1.3. System Overview (High-level description of the system and its architecture.)
    *   1.4. Definitions, Acronyms, and Abbreviations
2.  **Overall Description**:
    *   2.1. Product Perspective (How does this product fit with other products?)
    *   2.2. User Characteristics (Describe the different types of users.)
    *   2.3. Assumptions and Dependencies
3.  **Specific Requirements (The Core of the FRS)**:
    *   For EVERY single feature, provide a detailed breakdown. For example, for a "User Login" feature:
    *   **FR-LOGIN-001: User Authentication via Email**
        *   **Description:** The system shall allow registered users to log in using their email and password.
        *   **Trigger:** User navigates to the login page and submits credentials.
        *   **Pre-conditions:** User must have a registered and verified account.
        *   **Inputs:**
            *   Email Address (string, format: user@example.com)
            *   Password (string, min 8 chars, 1 uppercase, 1 number)
        *   **Processing Steps (Functional Flow):**
            1.  System validates email format. If invalid, display error "Invalid email format."
            2.  System validates password meets complexity rules. If invalid, display error "Invalid password format."
            3.  System checks if email exists in the user database. If not, display error "User not found."
            4.  System retrieves the hashed password for the user.
            5.  System compares the submitted password with the stored hash.
            6.  If they match, create a user session and redirect to the dashboard.
            7.  If they do not match, increment the failed login attempt counter. If counter > 5, lock account for 15 minutes and display error "Invalid credentials. Account locked." Otherwise, display "Invalid credentials."
        *   **Outputs:**
            *   Successful login redirects to the user dashboard.
            *   Specific error messages are displayed on failure.
        *   **Post-conditions:** User is authenticated and has a valid session token.
        *   **Acceptance Criteria:**
            *   Given a valid email and password, when I click "Login", then I should be redirected to my dashboard.
            *   Given an invalid email, when I click "Login", then I should see the "Invalid email format" error.
            *   (Add criteria for every possible scenario).
    *   **(Repeat this entire detailed structure for every conceivable function of the application described)**
4.  **Interface Requirements**:
    *   4.1. User Interfaces (UI) (Describe UI elements, layouts, and navigation flows.)
    *   4.2. Hardware Interfaces
    *   4.3. Software Interfaces (APIs, other systems.)
5.  **Use Cases**:
    *   Provide at least 5 detailed Use Cases (e.g., "Register New Account", "Search for Product", "Complete Purchase") with actors, preconditions, main flow, and alternative flows.

**If Document Type is "SRS" (Software Requirements Specification):**
Generate a complete SRS based on the IEEE 830 standard with exhaustive detail in every section:
1.  **Introduction**:
    *   1.1. Purpose
    *   1.2. Document Conventions
    *   1.3. Intended Audience
    *   1.4. Product Scope
    *   1.5. References
2.  **Overall Description**:
    *   2.1. Product Perspective
    *   2.2. Product Functions (Summary of major functions.)
    *   2.3. User Classes and Characteristics
    *   2.4. Operating Environment
    *   2.5. Design and Implementation Constraints
3.  **System Features**:
    *   3.1. System Feature 1 (e.g., User Profile Management)
        *   3.1.1. Description and Priority
        *   3.1.2. Stimulus/Response Sequences
        *   3.1.3. Functional Requirements (Provide a list of detailed functional requirements related to this feature, similar to the FRS format but summarized.)
    *   3.2. System Feature 2 (e.g., Inventory Management)
        *   ... (and so on for all features)
4.  **External Interface Requirements**:
    *   4.1. User Interfaces (Screens, mockups, GUI requirements)
    *   4.2. Hardware Interfaces
    *   4.3. Software Interfaces (APIs, database)
    *   4.4. Communications Interfaces (Protocols, security)
5.  **Non-functional Requirements**:
    *   5.1. Performance Requirements
    *   5.2. Safety Requirements
    *   5.3. Security Requirements
    *   5.4. Software Quality Attributes (Reliability, maintainability, portability)
6.  **Other Requirements** (e.g., Data, Legal, etc.)

Ensure the generated markdown is extremely comprehensive, detailed, well-formatted, and adheres to the requested length. The content must be of the highest professional standard, ready for a real-world project.
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

    