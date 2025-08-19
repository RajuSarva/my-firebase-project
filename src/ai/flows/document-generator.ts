
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
Generate a complete BRD using the following template. Adapt the content based on the provided Title and Description. Be extremely detailed.

# Business Requirements Document (BRD) - {{{title}}}

## 1. Introduction
This document outlines the business requirements for the development of the {{{title}}}. The application aims to {{{description}}}.

## 2. Project Goals and Objectives
*   **Goal**: To develop a user-friendly and efficient application, {{{title}}}, that connects [User A] with [User B] to [Primary Goal from Description].
*   **Objectives**:
    *   [Generate a detailed list of 5-7 specific business objectives based on the project description. Examples: Increase utilization of X, Reduce Y, Lower costs for Z, Minimize environmental impact, Provide a convenient and reliable platform.]

## 3. Target Audience
*   **[Primary User Persona, e.g., Drivers]**: [Describe this user type, their needs, and why they would use the app, based on the description.]
*   **[Secondary User Persona, e.g., Passengers]**: [Describe this user type, their needs, and why they would use the app, based on the description.]
*   **(Add more personas if implied by the description.)**

## 4. Scope
*   **Inclusions**:
    *   User registration and profile management for all user types.
    *   Core feature 1 (e.g., Ride posting and searching).
    *   Core feature 2 (e.g., Real-time matching based on key criteria).
    *   Core feature 3 (e.g., In-app communication).
    *   Secure payment gateway integration (if applicable).
    *   Rating and review system for users.
    *   Core feature 4 (e.g., Route optimization and mapping).
    *   History/Dashboard functionality.
    *   Support for multiple platforms (iOS and Android).
*   **Exclusions**:
    *   [List 2-3 logical exclusions. Examples: Direct insurance provided by the app, Direct employment of users, Integration with unrelated third-party systems.]

## 5. Functional Requirements
*   **User Registration and Authentication**: Users should be able to register with their email, phone number, or social media accounts. Implement two-factor authentication for enhanced security.
*   **Profile Management**: Users should be able to create and manage their profiles, including personal information, profile picture, and other relevant details (e.g., vehicle details for drivers).
*   **[Core Feature 1 - Detailed]**: [Provide a detailed description of the first core feature. e.g., For a carpool app, "Drivers should be able to post their planned trips, specifying origin, destination, date, time, available seats, and price per seat."]
*   **[Core Feature 2 - Detailed]**: [Provide a detailed description of the second core feature. e.g., "Passengers should be able to search for available rides based on their origin, destination, and preferred travel dates/times."]
*   **Real-time Matching**: The application should provide real-time matching of users based on their specified criteria.
*   **In-app Communication**: Users should be able to communicate with each other through in-app messaging or calling features.
*   **Payment Integration**: Secure payment gateway integration for processing payments.
*   **Rating and Review System**: Users should be able to rate and review each other after completing an interaction.
*   **[Core Feature 3 - Detailed]**: [Provide a detailed description of another core feature, e.g., "Integration with a mapping service to provide optimized routes and real-time navigation."]
*   **Trip History**: Users should be able to access a history of their past activities, including details like date, time, cost, and other relevant information.

## 6. Non-Functional Requirements
*   **Performance**: The application should be responsive and perform efficiently under high user load.
*   **Security**: User data should be protected through robust security measures, including data encryption.
*   **Scalability**: The application architecture should be scalable to accommodate future growth in user base and features.
*   **Usability**: The application should be user-friendly and intuitive to navigate.
*   **Reliability**: The application should be reliable and available with minimal downtime (e.g., 99.9% uptime).
*   **Accessibility**: The application should adhere to WCAG 2.1 AA accessibility guidelines.

## 7. Technical Requirements
*   **Platform**: iOS and Android mobile applications.
*   **Technology Stack**: (To be determined based on further analysis, but may include technologies such as React Native/Flutter for cross-platform, or Swift/Kotlin for native, and a backend like Node.js, Python, or Go with a database like PostgreSQL or MongoDB.)
*   **API Integrations**: Mapping API (e.g., Google Maps, Mapbox), Payment Gateway API (e.g., Stripe, PayPal), and potentially others based on features.

## 8. Open Issues/Risks
*   **Competition**: Analyze existing competitors in the market.
*   **User Adoption**: The challenge of attracting a critical mass of users to ensure platform viability.
*   **Security Concerns**: Protecting user data and preventing fraudulent activities.
*   **Regulatory Compliance**: Adhering to local regulations that may apply to the application's domain.

## 9. Future Enhancements (Roadmap)
*   [Suggest a logical future enhancement, e.g., "Integration with public transportation schedules."]
*   [Suggest another logical future enhancement, e.g., "Scheduling for recurring trips/interactions."]
*   [Suggest another logical future enhancement, e.g., "Enhanced safety features (e.g., emergency contact sharing)."]
*   [Suggest another logical future enhancement, e.g., "Gamification to encourage platform use."]

## 10. Approval
_________________________
(Project Sponsor)

_________________________
(Date)

This BRD serves as the foundation for the development of the {{{title}}}. It will be reviewed and updated as needed throughout the project lifecycle.

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
