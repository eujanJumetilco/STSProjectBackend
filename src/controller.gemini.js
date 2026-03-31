import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import responseParser from "./utilities/dataParser.js";
import fileToGenerativePart from "./utilities/fileToGenerativePart.js";

dotenv.config();

if (!process.env.API_KEY) {
    console.error("Missing API_KEY in .env file");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export async function evaluateContent(inputText, base64Image = null, mimeType = null) { 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = 
        `
            You are an AI assistant designed to analyze potential misinformation in social media content, specifically in the Philippine context. Your task is NOT to determine absolute truth, but to evaluate the RISK that the content may be misleading, false, or lacking context.

            ANALYSIS CRITERIA:

            Identify Claims: Break the text into separate, identifiable statements.

            Assess Evidence & Language: Check for citations, vagueness, emotional/sensational wording, and missing context.

            Philippine Context: Consider local events (elections, typhoons, holidays), common local misinformation patterns, and Tagalog/Taglish nuances.

            Assign Risk: LOW (credible), MEDIUM (suspicious/unverified), or HIGH (misleading/exaggerated).

            OUTPUT RULES:

            You must use the exact tag structure provided below for every claim identified.

            Do NOT use bullet points, bolding (**), or numbering.

            DO NOT use any special characters or text enclosing methods such as: \"solely because of qualifications\"

            ONLY FOLLOW THE FORMAT don't add anything else like /n because the developers will destructure the response content

            Do NOT include any introductory text or closing remarks.

            Each claim analysis must be a self-contained block using the tags.

            Use a concise, factual tone within the tags.

            REQUIRED FORMAT PER CLAIM:
            {/Claim/} [Insert the specific claim identified] {/Claim/}
            {/ClaimRiskLevel/} [Low / Medium / High] {/ClaimRiskLevel/}
            {/RiskLevelExplanation/} [Explain the risk based on evidence, language, and Philippine context] {/RiskLevelExplanation/}
            {/VerificationMethod/} [Mention specific official sources or news outlets needed for verification] {/VerificationMethod/}
            {/OverallAssessment/} [Provide a final verdict on the reliability of the post as a whole] {/OverallAssessment/}

            TEXT TO ANALYZE:
            ${inputText}
        `;
        
        const apiInput = [prompt];

        // If an image is included, unshift it to apiInput array
        if (base64Image != null && mimeType != null) apiInput.unshift(fileToGenerativePart(base64Image, mimeType)); 
        
        const result = await model.generateContent(apiInput);
        const response = (result.response).text();

        return responseParser(response); // parsed response
    } catch (error) {
        console.error("Error generating content:", error.message);
    }
}

// evaluateContent("Many analysts agree that the Philippines has completely eliminated political dynasties due to strict enforcement of the 1987 Constitution, which successfully banned all family members from holding public office at the same time. As a result, elections have become fully merit-based, with candidates winning solely because of their qualifications rather than name recall or family connections. This reform is often cited as the main reason why political competition in the country is now considered one of the fairest in Southeast Asia.");