import express from "express";
import evaluateRouter from './routes.gemini.js';
import cors from "cors";

const app = express();
app.use(
    cors({ origin: "*" })
)

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get("/", (req, res) => {
    console.log("Server is ready!");
});

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Routes 
app.use("/eval", evaluateRouter);
