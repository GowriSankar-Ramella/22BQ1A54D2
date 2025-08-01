const axios = require('axios');

async function Log(stack, level, packageName, message) {
    try {
        const logData = {
            stack: stack.toLowerCase(),
            level: level.toLowerCase(),
            package: packageName.toLowerCase(),
            message: message
        };

        const response = await axios.post('http://20.244.56.144/evaluation-service/logs', logData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnb3dyaXNhbmthcnJhbWVsbGFAZ21haWwuY29tIiwiZXhwIjoxNzU0MDMyODkwLCJpYXQiOjE3NTQwMzE5OTAsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJjMTVkMTZhZS1iYWU3LTRhMTYtYWI1My00ZTdhM2U0NThlZGIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyYW1lbGxhIGdvd3JpIHNhbmthciIsInN1YiI6IjE5ZTA4OTM3LTk4MjgtNGM3Ny04ZmZjLTZhMDZlNmU0N2E2NCJ9LCJlbWFpbCI6Imdvd3Jpc2Fua2FycmFtZWxsYUBnbWFpbC5jb20iLCJuYW1lIjoicmFtZWxsYSBnb3dyaSBzYW5rYXIiLCJyb2xsTm8iOiIyMmJxMWE1NGQyIiwiYWNjZXNzQ29kZSI6IlBuVkJGViIsImNsaWVudElEIjoiMTllMDg5MzctOTgyOC00Yzc3LThmZmMtNmEwNmU2ZTQ3YTY0IiwiY2xpZW50U2VjcmV0IjoiWHRqcmJqa2tnVWV0VEVDZSJ9.1OPFlB44h_kZyy6N9NBa67djsVVm3JGGQ1ltmqwPJhA'
            },
            timeout: 30000 // Increase timeout to 30 seconds
        });

        console.log(`✅ Log created successfully: ${response.data.logID}`);
        return response.data;

    } catch (error) {
        // Log the error but don't crash the application
        if (error.response) {
            console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error('❌ Network Error: No response from logging service');
        } else {
            console.error(`❌ Logging Error: ${error.message}`);
        }

        // Return a mock response to keep the application running
        const fallbackResponse = {
            logID: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message: "log processing failed but application continues"
        };

        console.log(`⚠️ Using fallback log ID: ${fallbackResponse.logID}`);
        return fallbackResponse;
    }
}

module.exports = { Log };
