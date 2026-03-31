import express from "express";
import evaluateRouter from './routes.gemini.js';
import cors from "cors";

const app = express();
app.use(
    cors({origin: "*"})
)

app.listen(8000, () => {
    console.log("Server is running on http://localhost:8000");
})
app.get("/", (req, res) => {
    console.log("Server is ready!");
});

app.use(express.json());
app.use(express.json({ limit: '30mb' })); 
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Routes 
app.use("/eval", evaluateRouter);