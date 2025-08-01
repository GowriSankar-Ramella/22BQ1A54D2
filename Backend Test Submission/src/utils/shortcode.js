/**
 * Generate a random shortcode
 * @param {number} length - Length of the shortcode
 * @returns {string} Generated shortcode
 */
function generateShortcode(length = 6) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Validate custom shortcode
 * @param {string} shortcode - Custom shortcode to validate
 * @returns {boolean} Whether shortcode is valid
 */
function isValidShortcode(shortcode) {
    // Must be alphanumeric and reasonable length
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(shortcode);
}

module.exports = {
    generateShortcode,
    isValidShortcode
};
