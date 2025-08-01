const express = require('express');
const { Log } = require('../middleware/logging');
const urlStore = require('../models/url');
const { generateShortcode, isValidShortcode } = require('../utils/shortcode');

const router = express.Router();

// Validate URL format
function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// Create Short URL
router.post('/shorturls', async (req, res) => {
    try {
        await Log('backend', 'info', 'route', 'POST /shorturls - Create short URL request received');

        const { url, validity = 30, shortcode: customShortcode } = req.body;

        // Validate required fields
        if (!url) {
            await Log('backend', 'error', 'handler', 'Missing required field: url');
            return res.status(400).json({
                error: 'Missing required field: url'
            });
        }

        // Validate URL format
        if (!isValidURL(url)) {
            await Log('backend', 'error', 'handler', `Invalid URL format: ${url}`);
            return res.status(400).json({
                error: 'Invalid URL format. Must be a valid HTTP/HTTPS URL'
            });
        }

        // Validate validity period
        if (typeof validity !== 'number' || validity <= 0) {
            await Log('backend', 'error', 'handler', `Invalid validity period: ${validity}`);
            return res.status(400).json({
                error: 'Validity must be a positive number representing minutes'
            });
        }

        let shortcode;

        // Handle custom shortcode
        if (customShortcode) {
            if (!isValidShortcode(customShortcode)) {
                await Log('backend', 'error', 'handler', `Invalid custom shortcode format: ${customShortcode}`);
                return res.status(400).json({
                    error: 'Custom shortcode must be alphanumeric and 3-20 characters long'
                });
            }

            if (urlStore.exists(customShortcode)) {
                await Log('backend', 'error', 'handler', `Shortcode collision: ${customShortcode}`);
                return res.status(409).json({
                    error: 'Custom shortcode already exists. Please choose a different one'
                });
            }

            shortcode = customShortcode;
            await Log('backend', 'info', 'service', `Using custom shortcode: ${shortcode}`);
        } else {
            // Generate unique shortcode
            do {
                shortcode = generateShortcode();
            } while (urlStore.exists(shortcode));

            await Log('backend', 'info', 'service', `Generated unique shortcode: ${shortcode}`);
        }

        // Create the short URL
        const urlData = urlStore.create(shortcode, url, validity);
        const shortLink = `http://hostname:port/${shortcode}`;

        await Log('backend', 'info', 'db', `URL record created for shortcode: ${shortcode}`);

        res.status(201).json({
            shortLink,
            expiry: urlData.expiry
        });

    } catch (error) {
        await Log('backend', 'error', 'handler', `Unhandled error in POST /shorturls: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Retrieve Short URL Statistics
router.get('/shorturls/:shortcode', async (req, res) => {
    try {
        const { shortcode } = req.params;

        await Log('backend', 'info', 'route', `GET /shorturls/${shortcode} - Statistics request received`);

        const urlData = urlStore.get(shortcode);

        if (!urlData) {
            await Log('backend', 'warn', 'handler', `Shortcode not found or expired: ${shortcode}`);
            return res.status(404).json({
                error: 'Shortcode not found or has expired'
            });
        }

        await Log('backend', 'info', 'service', `Retrieving statistics for shortcode: ${shortcode}`);

        const statistics = {
            shortcode: urlData.shortcode,
            originalUrl: urlData.originalUrl,
            createdAt: urlData.createdAt,
            expiry: urlData.expiry,
            totalClicks: urlData.clicks,
            clickDetails: urlData.clickData.map(click => ({
                timestamp: click.timestamp,
                source: click.source,
                referrer: click.referrer,
                location: click.location
            }))
        };

        res.json(statistics);

    } catch (error) {
        await Log('backend', 'error', 'handler', `Unhandled error in GET /shorturls/${req.params.shortcode}: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;
