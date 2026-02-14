const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// GET All Reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST New Report
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { category, confidence, lat, lng, address } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const newReport = new Report({
            category,
            confidence: parseFloat(confidence),
            location: { lat: parseFloat(lat), lng: parseFloat(lng) },
            address: address || "Unknown Location",
            imageUrl,
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPVOTE functionality
router.put('/:id/upvote', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).send('Report not found');

        report.upvotes += 1;
        await report.save();
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
