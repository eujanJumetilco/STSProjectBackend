import express from "express";
import { evaluateContent } from "./controller.gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try{
        const { textInput, base64Image, mimeType } = req.body;
        const result = await evaluateContent(textInput, base64Image, mimeType);

        res.status(200).json(result);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
});

export default router;