
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
This document outlines the business requirements for the development of {{{title}}}. The application aims to {{{description}}}.

## 2. Project Goals and Objectives
*   **Goal**: To develop a user-friendly and efficient application, {{{title}}}, that facilitates the primary goal derived from the project description.
*   **Objectives**:
    *   [Generate a detailed list of 5-7 specific business objectives based on the project description. Examples: Increase user engagement, Reduce operational costs, Enhance user satisfaction, Streamline a specific process, Provide a reliable platform for X.]

## 3. Target Audience
*   **[Primary User Persona]**: [Describe the primary user type, their needs, and why they would use the app, based on the description.]
*   **[Secondary User Persona]**: [Describe a secondary user type, their needs, and how they would benefit from the app.]
*   **(Add more personas if implied by the description.)**

## 4. Scope
*   **Inclusions**:
    *   User registration and profile management.
    *   Core feature 1 (Derive from description).
    *   Core feature 2 (Derive from description).
    *   Core feature 3 (Derive from description).
    *   In-app communication or notification system.
    *   Secure payment or transaction system (if applicable).
    *   Rating and review system.
    *   Dashboard or history functionality.
    *   Support for web and/or mobile platforms (iOS and Android).
*   **Exclusions**:
    *   [List 2-3 logical exclusions. Examples: Direct integration with unrelated third-party legacy systems, Features not mentioned in the core description, Hardware components.]

## 5. Functional Requirements
*   **User Registration and Authentication**: Users should be able to register using their email, phone number, or social media. Implement two-factor authentication for security.
*   **Profile Management**: Users should be able to create and manage their profiles, including personal information, preferences, and profile pictures.
*   **[Core Feature 1 - Detailed]**: [Provide a detailed breakdown of the first core feature based on the description. Explain what the user can do and how the system should respond.]
*   **[Core Feature 2 - Detailed]**: [Provide a detailed breakdown of the second core feature. Explain the user interactions and system behavior.]
*   **[Core Feature 3 - Detailed]**: [Provide a detailed breakdown of the third core feature, covering all aspects of its functionality.]
*   **In-app Communication**: A system for users to receive notifications or communicate with each other/the system.
*   **Payment Integration**: If applicable, describe the secure payment gateway integration for processing transactions.
*   **Rating and Review System**: Users should be able to rate and review services, products, or other users.
*   **History/Dashboard**: Users should have access to a dashboard or history section to view their past activities.

## 6. Non-Functional Requirements
*   **Performance**: The application must be responsive, with page load times under 3 seconds, and handle at least 1000 concurrent users without performance degradation.
*   **Security**: All user data, especially personal information and passwords, must be encrypted both in transit (TLS 1.2+) and at rest (AES-256).
*   **Scalability**: The architecture must be horizontally scalable to support a 50% growth in user base year-over-year without major re-architecting.
*   **Usability**: The user interface must be intuitive and follow standard HCI principles. A user should be able to complete core tasks without training.
*   **Reliability**: The system must have an uptime of 99.9% and include data backup and recovery plans.
*   **Accessibility**: The application must comply with WCAG 2.1 AA standards.

## 7. Technical Requirements
*   **Platform**: Specify iOS, Android, and/or Web application.
*   **Technology Stack**: To be determined, but may include modern frameworks like React/Next.js for frontend, Node.js/Python for backend, and a SQL/NoSQL database.
*   **API Integrations**: List potential third-party API integrations (e.g., Google Maps, Stripe, Twilio).

## 8. Open Issues/Risks
*   **Competition**: Analysis of key competitors in the market.
*   **User Adoption**: The challenge of attracting a critical mass of users.
*   **Data Security**: Risks associated with protecting sensitive user data from breaches.
*   **Regulatory Compliance**: Adherence to relevant local and international regulations (e.g., GDPR, CCPA).

## 9. Future Enhancements (Roadmap)
*   [Suggest a logical future enhancement based on the project description.]
*   [Suggest a second logical future enhancement.]
*   [Suggest a third logical future enhancement.]

## 10. Approval
_________________________
(Project Sponsor)

_________________________
(Date)

This BRD serves as the foundation for the development of {{{title}}}.

**If Document Type is "FRS" (Functional Requirements Specification):**
Generate a complete and exhaustive FRS based on the provided title and description. This document needs to be extremely detailed, breaking down every function into minute steps, user stories, and validation criteria. Use the following template as a strict guide.

# Functional Requirement Specification - {{{title}}}

## Document Overview
- **Document Title**: {{{title}}} - Functional Requirements Specification
- **Version**: 1.0
- **Date**: [Current Date]
- **Prepared by**: AI Requirement Analyst

## Document Control
| Version | Date          | Description    | Author                |
|---------|---------------|----------------|-----------------------|
| 1.0     | [Current Date]| Initial Draft  | AI Requirement Analyst|

## 1. Purpose
This document defines the functional requirements for the **{{{title}}}**. It aims to provide a secure, user-friendly, and robust solution that addresses the core functionalities outlined in the project description: **{{{description}}}**. This document will guide developers, QA teams, and project managers throughout the development lifecycle.

## 2. Functional Requirements

### 2.1 User Management & Authentication

#### **Feature**: Secure Registration
- **User Story**: As a new user, I want to register an account securely using my email and a password, so that I can access the platform's features.
- **Use Case**: User Registration
- **Actor**: New User
- **Pre-conditions**:
    1. The user has a valid email address.
    2. The user has access to the internet.
- **Basic Flow**:
    1. The user navigates to the application and selects the "Register" or "Sign Up" option.
    2. The user enters their full name, email address, and a strong password.
    3. The user agrees to the Terms of Service and Privacy Policy.
    4. The user clicks the "Register" button.
    5. The system sends a verification link or code to the user's email address.
    6. The user clicks the link or enters the code to verify their account.
- **Post-Condition**:
    1. A new user account is created in the system with a 'verified' status.
    2. The user is automatically logged in and redirected to the main dashboard or welcome page.
- **Validation**:
    1. Email address must be in a valid format (e.g., user@domain.com).
    2. Email address must be unique within the system.
    3. Password must meet complexity requirements (e.g., minimum 8 characters, 1 uppercase, 1 number, 1 special character).
    4. Full name should not be empty.

#### **Feature**: Secure Login
- **User Story**: As a registered user, I want to log in with my email and password, so that I can access my account and use the application.
- **Use Case**: User Login
- **Actor**: Registered User
- **Pre-condition**: The user has a verified account.
- **Basic Flow**:
    1. The user navigates to the "Login" or "Sign In" page.
    2. The user enters their registered email and password.
    3. The user clicks the "Login" button.
    4. The system authenticates the user's credentials against the database.
    5. Upon successful authentication, the user is granted access and redirected to their dashboard.
- **Post-Condition**:
    1. The user is successfully logged in and a session is created.
- **Validation**:
    1. An error message "Invalid email or password" is displayed if credentials do not match.
    2. After multiple failed attempts (e.g., 5), the account should be temporarily locked.

#### **Feature**: Profile Management
- **User Story**: As a user, I want to view and update my profile information, so that my details are always current.
- **Use Case**: Manage Profile
- **Actor**: Registered User
- **Pre-condition**: The user is logged in.
- **Basic Flow**:
    1. The user navigates to their "Profile" or "Account Settings" section.
    2. The user can view their current information (e.g., name, email, profile picture).
    3. The user can edit fields such as their name, profile picture, and other relevant details.
    4. The user clicks "Save" to apply the changes.
- **Post-Condition**: The user's profile information is updated in the database.
- **Validation**:
    1. Editable fields must adhere to their specific validation rules (e.g., email format).

---

### 2.2 Core Application Features

**(Generate 3-5 core features based on the project description. For each feature, provide the same detailed breakdown as above: Feature, User Story, Use Case, Actor, Pre-condition, Basic Flow, Post-Condition, and Validation.)**

#### **Feature**: [Core Feature 1 from Description]
- **User Story**: As a [user type], I want to [perform a core action], so that I can [achieve a primary goal].
- **Use Case**: [Name of Use Case]
- **Actor**: [User Type]
- **Pre-condition**: [e.g., User is logged in, User has necessary permissions]
- **Basic Flow**:
    1. [Step-by-step description of the user's interaction with the feature.]
    2. [System response to each user action.]
    3. ...
- **Post-Condition**: [The state of the system after the flow is completed successfully.]
- **Validation**:
    1. [Validation rule for input data.]
    2. [Error handling for invalid actions.]

#### **Feature**: [Core Feature 2 from Description]
- **User Story**: As a [user type], I want to [perform another core action], so that I can [achieve another goal].
- **Use Case**: [Name of Use Case]
- **Actor**: [User Type]
- **Pre-condition**: [e.g., User has completed a previous step.]
- **Basic Flow**:
    1. [Step-by-step description.]
    2. ...
- **Post-Condition**: [Result of the successful action.]
- **Validation**:
    1. [Validation rule.]

---

## 3. Administrative Panel (If applicable)

**(If the description implies an admin role, generate 1-2 admin features.)**

#### **Feature**: [Admin Feature 1, e.g., User Management]
- **User Story**: As an admin, I want to view and manage user accounts, so that I can maintain the platform and support users.
- **Use Case**: Manage Users
- **Actor**: Administrator
- **Pre-condition**: Admin is logged in to the administrative panel.
- **Basic Flow**:
    1. Admin navigates to the "Users" section.
    2. A list of all registered users is displayed with search and filter options.
    3. Admin can view details of a specific user.
    4. Admin can perform actions like deactivating or deleting a user account.
- **Post-Condition**: User account status is updated as per the admin's action.
- **Validation**:
    1. A confirmation dialog must be shown before any destructive action (e.g., deleting a user).


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
