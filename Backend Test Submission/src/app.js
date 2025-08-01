const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Change back to real logging middleware
const { Log } = require('./middleware/logging');
const shortUrlRoutes = require('./routes/shorturl');
const urlStore = require('./models/url');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/', shortUrlRoutes);

// Redirect handler for shortened URLs
app.get('/:shortcode', async (req, res) => {
    try {
        const { shortcode } = req.params;

        await Log('backend', 'info', 'route', `GET /${shortcode} - Redirect request received`);

        const urlData = urlStore.get(shortcode);

        if (!urlData) {
            await Log('backend', 'warn', 'handler', `Redirect failed - shortcode not found: ${shortcode}`);
            return res.status(404).json({
                error: 'Short URL not found or has expired'
            });
        }

        // Record the click
        const clickInfo = {
            source: req.get('User-Agent') || 'unknown',
            referrer: req.get('Referer') || 'direct',
            location: req.ip || 'unknown'
        };

        urlStore.recordClick(shortcode, clickInfo);

        await Log('backend', 'info', 'service', `Redirecting to: ${urlData.originalUrl}`);

        // Perform redirect
        res.redirect(302, urlData.originalUrl);

    } catch (error) {
        await Log('backend', 'error', 'handler', `Redirect error for /${req.params.shortcode}: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// 404 handler
app.use('*', async (req, res) => {
    await Log('backend', 'warn', 'route', `404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found'
    });
});

// Error handler
app.use(async (err, req, res, next) => {
    await Log('backend', 'error', 'handler', `Unhandled error: ${err.message}`);
    res.status(500).json({
        error: 'Internal server error'
    });
});

module.exports = app;
