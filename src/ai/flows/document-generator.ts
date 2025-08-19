
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
  currentDate: z.string().describe('The current date for the document.'),
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
- Current Date: {{{currentDate}}}
{{#if uploadedFile}}
- **Primary Source of Information**: The content of the following uploaded document should be used as the main source for generating the detailed requirements.
- Uploaded File Content: {{media url=uploadedFile}}
{{/if}}

Adhere strictly to the following structure based on the Document Type, ensuring every section is flushed out with substantial detail and examples.

**If Document Type is "BRD" (Business Requirements Document):**
Generate a complete BRD using the following template. Be extremely detailed and comprehensive, adapting the content logically from the project title, description, and uploaded file.

# Business Requirements Document (BRD) - {{{title}}}

## 1. Introduction
This document outlines the business requirements for the development of the {{{title}}}. The application aims to {{{description}}}.

## 2. Project Goals and Objectives
*   **Goal**: To develop a user-friendly and efficient application, {{{title}}}, that connects drivers with empty seats and passengers heading in the same direction, facilitating shared rides and reducing traffic congestion and carbon emissions.
*   **Objectives**:
    *   Increase the utilization of car capacity.
    *   Reduce traffic congestion in urban areas.
    *   Lower individual transportation costs.
    *   Minimize environmental impact through reduced emissions.
    *   Provide a convenient and reliable ride-sharing platform.

## 3. Target Audience
*   **Drivers**: Individuals who own cars and are willing to share their rides with others, offsetting travel costs.
*   **Passengers**: Individuals seeking a convenient and affordable alternative to public transportation or personal vehicles.

## 4. Scope
*   **Inclusions**:
    *   User registration and profile management (both driver and passenger).
    *   Ride posting and searching functionality.
    *   Real-time ride matching based on location and destination.
    *   In-app communication between drivers and passengers.
    *   Secure payment gateway integration.
    *   Rating and review system for drivers and passengers.
    *   Route optimization and navigation.
    *   Trip history tracking.
    *   Support for multiple platforms (iOS and Android).
*   **Exclusions**:
    *   Ride insurance provided directly by the application.
    *   Direct driver employment or management.
    *   Integration with public transportation schedules.

## 5. Functional Requirements
*   **User Registration and Authentication**: Users should be able to register with their email, phone number, or social media accounts. Two-factor authentication for enhanced security.
*   **Profile Management**: Users should be able to create and manage their profiles, including personal information, profile picture, and vehicle details (for drivers).
*   **Ride Posting (Drivers)**: Drivers should be able to post their planned trips, specifying origin, destination, date, time, available seats, and price per seat.
*   **Ride Searching (Passengers)**: Passengers should be able to search for available rides based on their origin, destination, and preferred travel dates/times.
*   **Real-time Matching**: The application should provide real-time matching of drivers and passengers based on their specified criteria.
*   **In-app Communication**: Drivers and passengers should be able to communicate with each other through in-app messaging or calling features.
*   **Payment Integration**: Secure payment gateway integration for processing ride payments.
*   **Rating and Review System**: Users should be able to rate and review each other after completing a trip.
*   **Route Optimization and Navigation**: Integration with a mapping service to provide optimized routes and real-time navigation for drivers.
*   **Trip History**: Users should be able to access a history of their past trips, including details like date, time, cost, and other relevant information.

## 6. Non-Functional Requirements
*   **Performance**: The application should be responsive and perform efficiently under high user load.
*   **Security**: User data should be protected through robust security measures.
*   **Scalability**: The application architecture should be scalable to accommodate future growth in user base and features.
*   **Usability**: The application should be user-friendly and intuitive to navigate.
*   **Reliability**: The application should be reliable and available with minimal downtime.
*   **Accessibility**: The application should adhere to accessibility guidelines for users with disabilities.

## 7. Technical Requirements
*   **Platform**: iOS and Android mobile applications.
*   **Technology Stack**: (To be determined based on further analysis, but may include technologies such as React Native, Node.js, MongoDB, etc.)
*   **API Integrations**: Mapping API (e.g., Google Maps, Mapbox), Payment Gateway API (e.g., Stripe, PayPal).

## 8. Open Issues/Risks
*   **Competition**: Existing ride-sharing platforms.
*   **User Adoption**: Attracting a critical mass of users.
*   **Security Concerns**: Protecting user data and preventing fraud.
*   **Regulatory Compliance**: Adhering to local transportation regulations.

## 9. Future Enhancements (Roadmap)
*   Integration with public transportation schedules.
*   Carpool scheduling for recurring trips.
*   Enhanced safety features (e.g., emergency contact sharing).
*   Gamification to encourage carpooling.

## 10. Approval
_________________________
(Project Sponsor)

_________________________
({{{currentDate}}})

This BRD serves as the foundation for the development of the {{{title}}}. It will be reviewed and updated as needed throughout the project lifecycle.


**If Document Type is "FRS" (Functional Requirements Specification):**
Generate a complete and exhaustive FRS based on the provided title, description, and uploaded file. This document needs to be extremely detailed, breaking down every function into minute steps, user stories, and validation criteria. Use the following template as a strict guide.

# Functional Requirement Specification - {{{title}}}

## Document Overview
- **Document Title**: {{{title}}} - Functional Requirements Specification
- **Version**: 1.0
- **Date**: {{{currentDate}}}
- **Prepared by**: Team Geega Tech

## Document Control
| Version | Date          | Description    | Author                |
|---------|---------------|----------------|-----------------------|
| 1.0     | {{{currentDate}}}| Initial Draft  | Team Geega Tech|

## 1. Purpose
This document defines the functional requirements for the **{{{title}}}**. It aims to provide a secure, user-friendly, and robust solution that addresses the core functionalities outlined in the project description: **{{{description}}}**. This document will guide developers, QA teams, and project managers throughout the development lifecycle.

## 2. Functional Requirements

### 2.1 User Management & Authentication

#### **Feature**: Secure Registration
- **User Story**: As a new user, I want to register an account securely using my email and phone number, so that I can create an account and access the platform.
- **Use Case**: User Registration
- **Actor**: New User
- **Pre-conditions**:
    1. The user has a valid email address.
    2. The user has a valid Phone Number.
- **Basic Flow**:
    1. The user opens the app and selects "Register."
    2. The user selects the registration method: Manual or Social Media.
    3. If manual registration: User enters Full name, Email, Phone number, Date of Birth (DOB), Blood group, Gender (Male, Female, Other). The user clicks the "Continue" button.
    4. The system sends a verification email and SMS with OTP.
    5. User lands on the OTP verification page.
    6. The user enters OTP and clicks the "Verify" button.
    7. Users can request to resend OTP if needed.
    8. The system verifies OTP and creates a user account.
- **Post-Condition**:
    1. A user account is created and can be used to log in.
    2. If the email or phone number is already registered, the user is notified.
- **Validation**:
    1. Email address should be in a valid format (e.g., example@example.com).
    2. Email address should be unique and not already registered.
    3. Phone number should be 10 digits long and unique.
    4. OTP should be 4 digits long and valid for a specified timeframe.
    5. Full name should not exceed 100 characters.

#### **Feature**: Secure Login
- **User Story**: Once registered, users can log in using their registered credentials.
- **Use Case**: User Login
- **Actor**: Registered users
- **Pre-condition**: User has a registered account.
- **Basic Flow**:
    1. User opens the app and selects "Sign In."
    2. User enters their registered mobile number.
    3. System sends OTP to the user's mobile number.
    4. User enters OTP and selects "Verify".
    5. System authenticates the user's credentials.
    6. Users are granted access to the platform.
- **Post-Condition**:
    1. User is logged in and can access the platform.
    2. If credentials are incorrect, the user is notified.

---

### 2.2 Core Application Features

**(Generate 5-7 core features based on the project description and uploaded file. For each feature, provide the same detailed breakdown as above: Feature, User Story, Use Case, Actor, Pre-condition, Basic Flow, Post-Condition, and Validation.)**

#### **Feature**: [Core Feature 1 from Description/File]
- **User Story**: As a [user type], I want to [perform a core action], so that I can [achieve a primary goal].
- **Use Case**: [Name of Use Case]
- **Actor**: [User Type]
- **Pre-condition**: [e.g., User is logged in, User has necessary permissions]
- **Basic Flow**:
    1. [Extremely detailed, step-by-step description of the user's interaction with the feature.]
    2. [System response to each user action.]
    3. ...
- **Post-Condition**: [The state of the system after the flow is completed successfully.]
- **Validation**:
    1. [Detailed validation rule for input data.]
    2. [Detailed error handling for invalid actions.]

---

## 3. Administrative Panels

**(If the description or file implies an admin role, generate detailed features for each type of admin: Hospital, Doctor, Lab, and Super Admin, covering all their functionalities like management of beds, services, profiles, appointments, reports, users, settings, etc.)**

---
## 4. System Architecture
- **Technology Stack**:
    - **Frontend**: Html5/CSS3/Javascript
    - **Application**: React Native
    - **Backend**: Laravel
    - **Database**: MySQL
    - **APIs & Integrations**: SMS, Map, Social Login, firebase notification

## 5. Intended Audience & Usage
- **Developers**: To implement system functionalities.
- **QA Team**: To validate features against specifications.
- **Project Manager & Business Analysts**: To ensure business alignment.
- **Stakeholders**: To review and approve system capabilities.

## 6. Client Acknowledgment and Approval
By signing below, the client acknowledges and approves the contents of this document, including the features, requirements, and specifications outlined. This approval signifies that all details are correct and satisfactory.
Client Name: ____________________________
Signature: ______________________________
Date: _________________________________


**If Document Type is "SRS" (Software Requirements Specification):**
Generate a complete SRS based on the IEEE 830 standard with exhaustive detail in every section, deriving details from the title, description, and uploaded file:
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

export async function generateRefinedDocument(input: Omit<GenerateRefinedDocumentInput, 'currentDate'>): Promise<GenerateRefinedDocumentOutput> {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return generateRefinedDocumentFlow({
        ...input,
        currentDate,
    });
}

    