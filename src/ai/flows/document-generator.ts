
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
  description: z.string().optional().describe('The description of the document.'),
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
  prompt: `You are a world-class expert in software development and project management documentation. Your task is to generate an exceptionally comprehensive, extremely detailed, and very lengthy document of the specified type. The document must be well-structured, professionally formatted in Markdown, and result in a document that would span at least 10-15 pages when converted to a standard PDF.

Base the document on the following inputs:
- Document Title: {{{title}}}
{{#if description}}
- Project Description: {{{description}}}
{{/if}}
- Document Type: {{{documentType}}}
- Current Date: {{{currentDate}}}
{{#if uploadedFile}}
- **Primary Source of Information**: The content of the following uploaded document should be used as the main source for generating the detailed requirements.
- Uploaded File Content: {{media url=uploadedFile}}
{{/if}}

Adhere strictly to the following structure based on the Document Type, ensuring every section is flushed out with substantial detail and examples. All headings and subheadings MUST be bold.

**If Document Type is "BRD" (Business Requirements Document):**
# **{{{title}}}: Business Requirement Document**
## **1. Author and Change Control**
| Approver | Name | Date Approved | Role | Signature | Version |
| :--- | :--- | :--- | :--- | :--- | :--- |
| | [Project Sponsor Name] | {{{currentDate}}} | Stakeholder | | 1.0 |

### **Change Control**
| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| 1.0 | {{{currentDate}}} | Project Team | Initial Draft |

## **2. Executive Summary**
### **Overview**
This section provides a high-level summary of the project. Based on the project title and description (if provided), generate a detailed overview of the proposed system, its purpose, the problem it solves, and the value it will bring to the business.

### **Department Summary**
Describe the core components of the project and which departments or user groups they will affect. For example, break it down into a User App, Vendor Panel, Admin Panel, etc., based on the project's nature.

## **3. Glossary**
Define all key terms, acronyms, and jargon associated with this project. Generate at least 15-20 relevant terms based on the project description.
| Term | Definition |
| :--- | :--- |
| *(Generate Term 1)* | *(Generate Definition 1)* |
| *(Generate Term 2)* | *(Generate Definition 2)* |
| ... | ... |

## **4. Business Goals**
Based on the project description, generate a detailed list of business goals, categorized into sections like 'Growth and Development'. Elaborate extensively on each goal, providing context, justification, and expected outcomes. Each goal should be specific, measurable, achievable, relevant, and time-bound (SMART), if possible.
### **Growth and Development:**
1. **(Generate Goal 1)**: (Elaborate on the goal in great detail)
2. **(Generate Goal 2)**: (Elaborate on the goal in great detail)
3. **(Generate Goal 3)**: (Elaborate on the goal in great detail)
4. ...

## **5. Project Overview and Objectives**
### **Overview:**
Provide a detailed narrative of the project. Describe the system's vision, what it will do, who will use it, and how it fits into the overall business strategy. This should be a significant expansion of the executive summary.

### **Objectives:**
List the specific, measurable outcomes the project is expected to achieve. These should be more granular than the business goals and very detailed.
1. **(Generate Objective 1)**: (Elaborate on the objective in great detail)
2. **(Generate Objective 2)**: (Elaborate on the objective in great detail)
3. **(Generate Objective 3)**: (Elaborate on the objective in great detail)
4. ...

## **6. Project Scope**
### **In Scope:**
List all the features, functionalities, and deliverables that are included in this project. Be extremely specific. Use multiple levels of bullet points and sub-points to structure the list comprehensively.
1. **(Generate Main Feature Area 1, e.g., User App):**
    - (Sub-feature 1.1)
        - (Detail 1.1.1)
        - (Detail 1.1.2)
    - (Sub-feature 1.2)
2. **(Generate Main Feature Area 2, e.g., Admin Panel):**
    - (Sub-feature 2.1)
        - (Detail 2.1.1)
    - (Sub-feature 2.2)

### **Out of Scope:**
Clearly define what will **not** be included in the project to manage expectations. Be explicit and provide reasons.
1. **(Generate Out of Scope Item 1):**
2. **(Generate Out of Scope Item 2):**
3. ...

## **7. Success Criteria**
Define the metrics that will be used to measure the success of the project in detail.
### **Metrics for Success:**
1. **(Generate Metric 1, e.g., User Acquisition):**
    - Target: (Define a specific target and how it will be measured)
2. **(Generate Metric 2, e.g., Engagement Volume):**
    - Target: (Define a specific target and how it will be measured)
3. **(Generate Metric 3, e.g., System Performance):**
    - Target: (Define a specific target and how it will be measured)

## **8. Current State**
Describe the current process or system that is in place before this project is implemented. Elaborate significantly on the pain points and inefficiencies of the current state.
### **Current Situation:**
- (Describe current process/system in detail)
- (Describe current challenges with examples)

## **9. Target State**
Describe the desired future state after the project is successfully implemented. Explain in great detail how the new system will improve upon the current state.
### **Future State:**
- (Describe the fully functional new platform with all its benefits)
- (Describe the robust new processes in detail)

## **10. RAID (Risks, Assumptions, Issues, Dependencies)**
### **Risks**
Identify potential risks that could negatively impact the project's success. Provide detailed mitigation strategies for each.
1. **(Generate Risk 1):** (Detailed mitigation strategy)
2. **(Generate Risk 2):** (Detailed mitigation strategy)

### **Assumptions**
List all assumptions being made at the start of the project. Explain the impact if an assumption is proven false.
1. **(Generate Assumption 1)**
2. **(Generate Assumption 2)**

### **Issues**
List any known issues or problems that need to be addressed, with proposed solutions.
1. **(Generate Issue 1)**
2. **(Generate Issue 2)**

### **Dependencies**
List all external factors or other projects that this project depends on, explaining the nature of the dependency.
1. **(Generate Dependency 1)**
2. **(Generate Dependency 2)**

## **11. Major Requirements**
This is the core of the BRD. Generate an extremely detailed list of high-level requirements for each major component of the system.
### **High-Level Requirements**
#### **1. (Generate Component 1, e.g., Admin Panel)**
    ##### **1.1 (Generate Feature Group 1.1, e.g., User Management)**
    - (Detail requirement 1.1.1 with rationale)
    - (Detail requirement 1.1.2 with rationale)
    ##### **1.2 (Generate Feature Group 1.2, e.g., Content Management)**
    - (Detail requirement 1.2.1 with rationale)
    - (Detail requirement 1.2.2 with rationale)

#### **2. (Generate Component 2, e.g., User Panel)**
    ##### **2.1 (Generate Feature Group 2.1, e.g., Authentication)**
    - (Detail requirement 2.1.1 with rationale)
    - (Detail requirement 2.1.2 with rationale)

## **12. Business Rules and Acceptance Criteria**
### **Business Rules**
List the specific rules and policies that the system must adhere to. Provide at least 10-15 detailed rules.
1. **(Generate Business Rule 1)**
2. **(Generate Business Rule 2)**
3. ...

### **Acceptance Criteria**
For each major requirement, define detailed criteria that will be used to determine if it has been successfully implemented.
1. **(For Requirement 1):**
    - (Criterion 1.1)
    - (Criterion 1.2)
2. **(For Requirement 2):**
    - (Criterion 2.1)
    - (Criterion 2.2)

## **13. Reference Documents**
List any other relevant documents.
- (e.g., Project Proposal, Market Analysis, etc.)

## **14. Support**
Describe the post-launch support plan in detail.

## **15. Pointers to be noted**
Include any important notes regarding project execution, costing, or timelines.

## **16. Deliverables**
List the tangible outputs of the project with detailed descriptions.
1. Fully functional platform with all specified panels.
2. Comprehensive documentation (User manuals, API docs, etc.).
3. ...

## **17. Payment Details**
Include placeholder for payment information if applicable.


**If Document Type is "FRS" (Functional Requirements Specification):**
# **Functional Requirement Specification - {{{title}}}**

## **Document Overview**
- **Document Title**: {{{title}}} - Functional Requirements Specification
- **Version**: 1.0
- **Date**: {{{currentDate}}}
- **Prepared by**: Team Geega Tech

## **Document Control**
| Version | Date          | Description    | Author                |
|---------|---------------|----------------|-----------------------|
| 1.0     | {{{currentDate}}}| Initial Draft  | Team Geega Tech|

## **1. Introduction**
### **1.1 Purpose**
This document outlines the Functional Requirements for the **{{{title}}}**. Its purpose is to provide a detailed description of the system's intended behavior, functionalities, and user interactions. This FRS will serve as the primary guide for the development and testing teams to ensure the final product meets all specified requirements.

### **1.2 Scope**
(Based on the title and description, generate a detailed paragraph describing the scope of the project. What are the boundaries of the system? What are the key deliverables?)

### **1.3 Definitions, Acronyms, and Abbreviations**
(Generate a list of 10-15 relevant definitions for terms and acronyms that will be used throughout the document.)
- **FRS**: Functional Requirements Specification
- **UI**: User Interface
- ...

### **1.4 References**
(List any reference documents, such as the Business Requirements Document (BRD), market analyses, or user studies.)
- **BRD**: {{{title}}} Business Requirements Document
- ...

### **1.5 Overview**
(Provide a brief overview of the rest of the FRS document, describing what each section contains.)

## **2. Overall Description**
### **2.1 Product Perspective**
(Describe the product's context and origin. Is it a new system, a replacement, or an enhancement? How does it fit with other systems or business processes?)

### **2.2 User Characteristics**
(Describe the different types of users who will interact with the system, e.g., 'End User', 'Administrator', 'Vendor'. Detail their technical expertise and responsibilities.)

### **2.3 General Constraints**
(List any general constraints that will limit the developers' options, such as regulatory policies, hardware limitations, or mandated technologies.)

### **2.4 Assumptions and Dependencies**
(List any assumptions that, if incorrect, could impact the project. Also, list any dependencies on external factors or third-party components.)

## **3. System Features and Requirements**
**(This is the core of the FRS. Generate at least 15-20 core features based on the project title, description, and/or uploaded file. For each feature, provide the same extremely detailed breakdown as the examples below. Ensure the "Basic Flow" section contains a comprehensive, step-by-step description of user actions and system responses. The "Validation" section must contain multiple, specific validation rules.)**

### **3.1 User Management & Authentication**

#### **Feature 3.1.1**: Secure User Registration
- **User Story**: As a new user, I want to register for an account securely so that I can access the platform's features.
- **Use Case ID**: UC-001
- **Actor**: Unregistered User
- **Priority**: High
- **Pre-conditions**:
    1. User has access to the application via a web browser or mobile device.
    2. User has a valid, unique email address.
- **Basic Flow**:
    1. User navigates to the application and selects the "Sign Up" or "Register" option.
    2. The system displays a registration form requesting First Name, Last Name, Email Address, and Password.
    3. User fills in the required fields.
    4. User clicks the "Create Account" button.
    5. The system validates the input data (see Validation Rules below).
    6. The system creates a new user account with a 'Pending Verification' status.
    7. The system sends a verification email with a unique link to the user's email address.
    8. The system displays a message informing the user to check their email to verify their account.
- **Post-Condition**:
    1. A new user account is created in the system.
    2. The user is able to log in after verifying their email.
- **Validation Rules**:
    1. First Name and Last Name must not be empty and contain only alphabetic characters.
    2. Email address must be in a valid format (e.g., user@example.com) and must be unique.
    3. Password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character.
    4. If validation fails, the system displays specific error messages for each invalid field.

#### **Feature 3.1.2**: Secure User Login
- **User Story**: As a registered user, I want to log in to my account so that I can access my profile and use the application.
- **Use Case ID**: UC-002
- **Actor**: Registered User
- **Priority**: High
- **Pre-condition**: User has a registered and verified account.
- **Basic Flow**:
    1. User navigates to the application and selects the "Login" or "Sign In" option.
    2. The system displays a login form requesting Email Address and Password.
    3. User enters their credentials and clicks "Login".
    4. The system authenticates the credentials against the user database.
    5. Upon successful authentication, the user is redirected to their dashboard or the main application page.
- **Post-Condition**:
    1. User is logged in and a session is created.
    2. If authentication fails, an "Invalid credentials" error message is displayed.
- **Validation Rules**:
    1. Email and Password fields cannot be empty.

---

### **3.2 [Generate Core Feature Area 2]**
#### **Feature 3.2.1**: [Generate Feature Name]
- **User Story**: As a [user type], I want to [perform a core action], so that I can [achieve a primary goal].
- **Use Case ID**: UC-003
- **Actor**: [User Type]
- **Priority**: [High/Medium/Low]
- **Pre-condition**: [e.g., User is logged in, User has necessary permissions]
- **Basic Flow**:
    1. [Extremely detailed, step-by-step description of the user's interaction with the feature. Add many steps.]
    2. [System response to each user action.]
    3. ...
- **Post-Condition**: [The state of the system after the flow is completed successfully.]
- **Validation Rules**:
    1. [Detailed validation rule for input data 1.]
    2. [Detailed validation rule for input data 2.]
    3. [Detailed error handling for invalid actions.]
    4. ...

---

## **4. External Interface Requirements**
### **4.1 User Interfaces**
(Describe the overall look and feel of the UI. Mention any branding, layout, or accessibility (WCAG) requirements.)
### **4.2 Software Interfaces**
(Describe any interactions with other software components, such as third-party APIs for payments, maps, or social media login.)
### **4.3 Hardware Interfaces**
(Describe any hardware the system needs to interact with, e.g., printers, scanners.)
### **4.4 Communications Interfaces**
(Describe any communication protocols that will be used, e.g., REST, SOAP, and any security measures like HTTPS/SSL.)

## **5. Non-Functional Requirements**
### **5.1 Performance**
(Specify performance requirements, e.g., "Page load time should be under 3 seconds", "API responses should be under 500ms for 95% of requests".)
### **5.2 Security**
(Detail security requirements, such as data encryption at rest and in transit, protection against SQL injection and XSS, and role-based access control.)
### **5.3 Reliability**
(Define reliability requirements, e.g., "The system shall have 99.9% uptime".)
### **5.4 Maintainability**
(Describe requirements for maintainability, such as coding standards, logging, and documentation.)

## **6. Client Acknowledgment and Approval**
By signing below, the client acknowledges and approves the contents of this document, including the features, requirements, and specifications outlined. This approval signifies that all details are correct and satisfactory.
Client Name: ____________________________
Signature: ______________________________
Date: _________________________________


**If Document Type is "SRS" (Software Requirements Specification):**
# **Software Requirements Specification for {{{title}}}**
## **1. Introduction**
### **1.1. Purpose**
(Generate a very detailed purpose statement for the SRS based on the project title and description.)
### **1.2. Document Conventions**
(Describe the conventions used in this document, e.g., formatting, terminology.)
### **1.3. Intended Audience**
(List and describe the intended audience for this SRS, e.g., developers, project managers, QA teams.)
### **1.4. Product Scope**
(Provide a very detailed description of the product's scope, its boundaries, and major capabilities, with specific examples.)
### **1.5. References**
(List any other documents referenced in this SRS.)

## **2. Overall Description**
### **2.1. Product Perspective**
(Describe the product's relationship to other products or systems in detail.)
### **2.2. Product Functions**
(Provide a detailed summary of the major functions the product will perform, generated from the description.)
### **2.3. User Classes and Characteristics**
(Identify the different classes of users and describe their characteristics, permissions, and workflows in detail.)
### **2.4. Operating Environment**
(Describe the environment in which the software will operate, including hardware, operating systems, and other software.)
### **2.5. Design and Implementation Constraints**
(List any constraints on the design or implementation, such as language, libraries, or regulatory constraints, with explanations.)

## **3. System Features**
(Generate detailed descriptions for at least 10-15 key system features.)
### **3.1. System Feature 1 (e.g., User Profile Management)**
#### **3.1.1. Description and Priority**
(Provide a detailed description of the feature and its priority.)
#### **3.1.2. Stimulus/Response Sequences**
(Detail the sequences of user actions and system responses with exhaustive steps.)
#### **3.1.3. Functional Requirements**
(Provide an extremely detailed, itemized list of the functional requirements for this feature, including sub-requirements.)
### **3.2. System Feature 2**
... (and so on for all features)

## **4. External Interface Requirements**
### **4.1. User Interfaces**
(Describe the user interface requirements in detail, including screen layouts, GUI standards, and interaction design principles.)
### **4.2. Hardware Interfaces**
(Describe any hardware interfaces the software will have.)
### **4.3. Software Interfaces**
(Describe any software interfaces, like APIs to other systems or database connections, specifying data formats and protocols.)
### **4.4. Communications Interfaces**
(Describe any communications interfaces, such as network protocols or security requirements like SSL/TLS.)

## **5. Non-functional Requirements**
### **5.1. Performance Requirements**
(Detail the performance requirements, such as response times under specific loads, throughput, and capacity, with measurable targets.)
### **5.2. Safety Requirements**
(Detail any safety requirements for the system, including handling of hazardous conditions.)
### **5.3. Security Requirements**
(Detail the security requirements, including access control, data encryption, user authentication, and protection against common vulnerabilities.)
### **5.4. Software Quality Attributes**
(Detail the desired software quality attributes, such as reliability (MTBF), availability (uptime percentage), maintainability, and portability.)

## **6. Other Requirements**
(Detail any other requirements not covered elsewhere, such as legal, regulatory (e.g., GDPR, HIPAA), or data requirements.)

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
