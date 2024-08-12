const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

app.post('/extract', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pdfData = await pdfParse(req.file.buffer);

        // Log the extracted text for debugging
        console.log('Extracted Text:', pdfData.text);

        // Extract customer details
        const customerDetailsRegex = /Customer Details:\s*(.*)/i;
        const customerDetails = pdfData.text.match(customerDetailsRegex)?.[1]?.trim();

        // Extract products (ensure it doesn't capture the total amount)
        const productsRegex = /(?:ITEMS?|Products?:|HSN\/SAC.*?\n)([\s\S]*?)(?=\n\s*Total\s*Amount)/i;
        const products = pdfData.text.match(productsRegex)?.[1]?.replace(/\s+/g, ' ').trim();

        // Extract total amount (ensure it captures only the amount)
        const totalAmountRegex = /Total\s*Amount[:\s]*₹?\s*([0-9,]+(?:\.\d{2})?)/i;
        const totalAmount = pdfData.text.match(totalAmountRegex)?.[1]?.trim();

        console.log('Customer Details:', customerDetails);
        console.log('Products:', products);
        console.log('Total Amount:', totalAmount);

        const extractedData = {
            customerDetails: customerDetails || "Not found",
            products: products || "Not found",
            totalAmount: totalAmount || "Not found"
        };

        res.json({ extractedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during extraction' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});