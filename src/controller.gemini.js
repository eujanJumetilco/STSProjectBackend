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
        //const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const model = genAI.getGenerativeModel({ 
            // CHANGE THIS: 'gemini-1.5-flash' is often deprecated in favor of:
            model: "gemini-2.5-flash", 
            tools: [{ googleSearch: {} }] 
        });
        const today = new Date();
        const formattedDate = today.toLocaleDateString(); 

        const oldPrompt = 
        `
            TODAY'S DATE: ${formattedDate}

            You are an AI assistant designed to analyze potential misinformation in social media content, specifically in the Philippine context. Your task is NOT to determine absolute truth, but to evaluate the RISK that the content may be misleading, false, or lacking context.

            GROUNDING INSTRUCTION:
            Before analyzing, you MUST use your Google Search tool to verify the current status of the people, events, and claims mentioned in the inputText. Compare the inputText against the most recent reputable news reports (from 2025-2026) to identify discrepancies or "zombie" misinformation (old news being shared as new).

            ANALYSIS CRITERIA:

            Identify Claims: Break the text into separate, identifiable statements. Include claims found within images if attached.

            Assess Evidence & Language: Check for citations, emotional/sensational wording, and missing context.

            Philippine Context: Consider local events (elections, typhoons, holidays), common local misinformation patterns, and Tagalog/Taglish nuances.

            Assign Risk: LOW (credible), MEDIUM (suspicious/unverified), or HIGH (misleading/exaggerated).

            Visual Integrity: Detect image fraud like fake news templates, mismatched fonts/logos, AI artifacts, or captions contradicting visual evidence.

            OUTPUT RULES:
            - You must use the exact tag structure provided below for every claim identified.
            - Do NOT use bullet points, bolding (**), or numbering.
            - DO NOT use any special characters or text enclosing methods.
            - ONLY FOLLOW THE FORMAT; do not add any other text or characters.
            - Each claim analysis must be a self-contained block using the tags.

            REQUIRED FORMAT PER CLAIM:
            {/Claim/} [Insert the specific claim identified] {/Claim/}
            {/ClaimRiskLevel/} [Low / Medium / High] {/ClaimRiskLevel/}
            {/RiskLevelExplanation/} [Explain the risk using search results, evidence, and Philippine context. Explicitly mention if the info is outdated compared to 2026 facts.] {/RiskLevelExplanation/}
            {/VerificationMethod/} [Mention specific official sources or news outlets used to verify the claim] {/VerificationMethod/}
            {/OverallAssessment/} [Provide a final verdict on the reliability of the post as a whole] {/OverallAssessment/}

            TEXT TO ANALYZE:
            ${inputText}
        `;

        const prompt = `
            TODAY'S DATE: ${formattedDate}

            You are an AI assistant designed to analyze potential misinformation in social media content, specifically in the Philippine context. Your task is NOT to determine absolute truth, but to evaluate the RISK that the content may be misleading, false, or lacking context.

            GROUNDING INSTRUCTION:
            Before analyzing, you MUST use your Google Search tool to verify the current status of the people, events, and claims mentioned in the inputText. Compare the inputText against the most recent reputable news reports (from 2025-2026) to identify discrepancies or "zombie" misinformation (old news being shared as new).

            ANALYSIS CRITERIA:
            Identify Claims: Break the text into separate, identifiable statements. Include claims found within images if attached.
            Assess Evidence & Language: Check for citations, emotional/sensational wording, and missing context.
            Philippine Context: Consider local events (elections, typhoons, holidays), common local misinformation patterns, and Tagalog/Taglish nuances.
            Assign Risk: LOW (credible), MEDIUM (suspicious/unverified), or HIGH (misleading/exaggerated).
            Visual Integrity: Detect image fraud like fake news templates, mismatched fonts/logos, AI artifacts, or captions contradicting visual evidence.

            OUTPUT RULES:
            - You must use the exact tag structure provided below for every claim identified.
            - STRICT BAN ON ESCAPE CHARACTERS: Do NOT use backslashes (\\), or escaped quotes (\\"). 
            - STRICT BAN ON QUOTES: Do NOT enclose any words in double ("") or single ('') quotes within the explanation. Use plain text only.
            - Do NOT use bullet points, bolding (**), or numbering.
            - ONLY FOLLOW THE FORMAT; do not add any other text, characters, or markdown.
            - Each claim analysis must be a self-contained block using the tags.

            REQUIRED FORMAT PER CLAIM:
            {/Claim/} [Insert the specific claim identified] {/Claim/}
            {/ClaimRiskLevel/} [Low / Medium / High] {/ClaimRiskLevel/}
            {/RiskLevelExplanation/} [Explain the risk using search results, evidence, and Philippine context. Explicitly mention if the info is outdated compared to 2026 facts.] {/RiskLevelExplanation/}
            {/VerificationMethod/} [Mention specific official sources or news outlets used to verify the claim] {/VerificationMethod/}
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