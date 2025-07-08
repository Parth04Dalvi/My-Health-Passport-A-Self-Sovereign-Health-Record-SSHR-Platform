# My-Health-Passport-A-Self-Sovereign-Health-Record-SSHR-Platform

My Health Passport: A Self-Sovereign Health Record (SSHR) Platform
The future of healthcare is in your hands, powered by Web3 and AI.

My Health Passport is a forward-thinking web application that demonstrates the power of self-sovereign identity in the medical field. It provides patients with a single, unified dashboard to own, manage, and control their complete medical history. By leveraging a secure backend and integrating cutting-edge AI, this project serves as a robust proof-of-concept for a more patient-centric healthcare system.

Core Features
This application is packed with features designed to empower patients and streamline healthcare data management.

Self-Sovereign Record Management: Patients have full control over their medical records. They can add, view, and manage all entries in their health history.

Provider Access Control: Easily grant or revoke data access for any healthcare provider with a single click, ensuring that your data is only seen by those you trust.

AI-Powered Summarization (Gemini API): Demystify complex medical jargon. Each record can be summarized by Google's Gemini AI into simple, easy-to-understand language.

AI Health Assistant (Gemini API): An interactive chat assistant that uses the context of your entire health history to answer general questions, helping you find connections and understand your health journey.

Interactive Health Timeline: Visualize your medical history on a chronological timeline, providing an intuitive, at-a-glance overview of your health journey.

Data Portability: Export all your health records and provider information to a JSON file at any time. Your data is truly yours.

Dynamic & Responsive UI: A beautiful, modern interface with a dynamic, animated background that works seamlessly on desktop, tablet, and mobile devices.

Real-time & Secure Backend: Built on Firebase Firestore, all data is stored securely and updated in real-time across all sessions.

Tech Stack
This project is built with a modern, scalable, and powerful set of technologies:

Frontend: React

Backend & Database: Google Firebase (Firestore, Authentication)

AI Integration: Google Gemini API

Styling: Tailwind CSS

Animation: HTML5 Canvas API

Local Setup and Installation
To run this project on your local machine, follow these steps:

1. Prerequisites
Node.js and npm (or yarn) installed on your machine.

A Google account to create a Firebase project.

2. Clone & Install Dependencies
First, clone the repository and install the necessary npm packages.

git clone https://github.com/your-username/my-health-passport.git
cd my-health-passport
npm install

3. Set Up Firebase
This project requires a Firebase project to handle the backend database and authentication.

Create a Firebase Project: Go to the Firebase Console and create a new project.

Create a Web App: Inside your project, add a new Web App (</>).

Copy Config: After registering the app, Firebase will provide you with a firebaseConfig object. Copy this.

Enable Firestore: In the console, go to Build > Firestore Database and create a new database in Test Mode.

Enable Authentication: Go to Build > Authentication, select the Sign-in method tab, and enable the Anonymous provider.

4. Configure Environment Variables
In the project's src/App.js file, locate the firebaseConfig constant and replace the placeholder with the object you copied from your Firebase project.

// src/App.js

// --- Firebase Configuration and Initialization ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    // ...etc
};

5. Configure Gemini API Key
The AI features require a Gemini API key.

Get your key from the Google AI Studio.

In the src/App.js file, find the handleSummarize and handleAskAI functions. Locate the line const apiKey = ""; and paste your key inside the quotes.

// Inside handleSummarize and handleAskAI
const apiKey = "YOUR_GEMINI_API_KEY";

6. Run the Application
You're all set! Start the development server with:

npm start

The application will be running at http://localhost:3000.

Future Development
This project serves as a strong foundation. Future enhancements could include:

True Web3 Integration: Replacing Firebase authentication with a wallet-based connection (e.g., MetaMask) and storing record pointers as NFTs.

Decentralized Storage: Using IPFS or Arweave to store the encrypted medical data files.

Advanced Provider Verification: Creating a system for verifying healthcare providers' credentials on-chain.

Sharing with Insurance: A module for securely and selectively sharing relevant data with insurance companies for claims processing.
