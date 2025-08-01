const app = require('./src/app');
const { Log } = require('./src/middleware/logging');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await Log('backend', 'info', 'service', `URL Shortener Microservice started on port ${PORT}`);
    console.log(`🚀 URL Shortener running on http://localhost:${PORT}`);
    console.log('📝 API Endpoints:');
    console.log('   POST /shorturls - Create short URL');
    console.log('   GET /shorturls/:shortcode - Get statistics');
    console.log('   GET /:shortcode - Redirect to original URL');
});
