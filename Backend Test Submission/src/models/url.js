// In-memory storage for URLs
class URLStore {
    constructor() {
        this.urls = new Map(); // shortcode -> { originalUrl, expiry, clicks, createdAt, clickData }
    }

    // Create a new shortened URL
    create(shortcode, originalUrl, validity = 30) {
        const now = new Date();
        const expiry = new Date(now.getTime() + (validity * 60 * 1000)); // Convert minutes to milliseconds

        const urlData = {
            shortcode,
            originalUrl,
            expiry: expiry.toISOString(),
            createdAt: now.toISOString(),
            clicks: 0,
            clickData: []
        };

        this.urls.set(shortcode, urlData);
        return urlData;
    }

    // Get URL by shortcode
    get(shortcode) {
        const urlData = this.urls.get(shortcode);
        if (!urlData) return null;

        // Check if expired
        if (new Date() > new Date(urlData.expiry)) {
            this.urls.delete(shortcode);
            return null;
        }

        return urlData;
    }

    // Record a click
    recordClick(shortcode, clickInfo) {
        const urlData = this.urls.get(shortcode);
        if (urlData && new Date() <= new Date(urlData.expiry)) {
            urlData.clicks++;
            urlData.clickData.push({
                timestamp: new Date().toISOString(),
                source: clickInfo.source || 'unknown',
                referrer: clickInfo.referrer || 'direct',
                location: clickInfo.location || 'unknown'
            });
            return true;
        }
        return false;
    }

    // Check if shortcode exists
    exists(shortcode) {
        return this.urls.has(shortcode);
    }
}

module.exports = new URLStore();
