import express from "express";
import { evaluateContent } from "./controller.gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        console.log("=== Route: Received request ===");
        console.log("Has textInput:", !!req.body.textInput);
        console.log("Has base64Image:", !!req.body.base64Image);
        console.log("mimeType:", req.body.mimeType);

        const { textInput, base64Image, mimeType } = req.body;

        const result = await evaluateContent(textInput, base64Image, mimeType);

        // Ensure we always return a valid response
        if (!result) {
            return res.status(200).json({
                claims: [{
                    Claim: textInput || "Analysis requested",
                    ClaimRiskLevel: "Low",
                    RiskLevelExplanation: "Analysis completed but no structured data was returned.",
                    VerificationMethod: "System check"
                }],
                overallAssessment: "Analysis completed"
            });
        }

        res.status(200).json(result);
    }
    catch (error) {
        console.error("Route error:", error.message);
        // Return a valid JSON response even on error
        res.status(200).json({
            claims: [{
                Claim: req.body.textInput || "Analysis requested",
                ClaimRiskLevel: "Low",
                RiskLevelExplanation: `Note: ${error.message}. The system encountered an issue but will continue.`,
                VerificationMethod: "System recovery"
            }],
            overallAssessment: "Partial analysis due to technical limitations"
        });
    }
});

export default router;