#  URL Shortener


A simple URL shortener service built for the  platform. It takes long URLs and creates short, shareable links while tracking how often they're used.

## What it does

- Turn long URLs into short, easy-to-share links
- Create custom short codes or let the system generate them automatically
- Track who clicks your links and when
- Set expiration dates for your shortened URLs
- Log everything that happens for monitoring and debugging
- Keep your data secure with built-in security features
- Store everything in memory for fast access (great for development and testing)

## Table of Contents

- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [How to use the API](#how-to-use-the-api)
- [Examples](#examples)
- [Project Structure](#project-structure)
- [Logging](#logging)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### What you'll need

- Node.js version 18 or newer
- npm (comes with Node.js) or yarn

### Setting it up

1. **Get the code**

   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install the dependencies**

   ```bash
   npm install
   ```

3. **Run the server**

   ```bash
   # For production
   npm start

   # For development (restarts automatically when you change files)
   npm run dev
   ```

Once it's running, you can access it at `http://localhost:3000`.

## Configuration

### Environment Variables

Right now there's only one setting you can change:

| Variable | What it does                  | Default value |
| -------- | ----------------------------- | ------------- |
| `PORT`   | Which port the server runs on | `3000`        |

### What's included

This project uses several helpful libraries:

- **express**: The web framework that handles HTTP requests
- **cors**: Allows requests from different domains
- **helmet**: Adds security headers to protect your app
- **morgan**: Logs all HTTP requests
- **axios**: Makes HTTP requests to other services
- **uuid**: Generates unique IDs

## How to use the API

### The API base URL

```
http://localhost:3000
```

### Available endpoints

#### Creating a short URL

**POST** `/shorturls`

This creates a new short URL. You can provide your own custom short code or let the system generate one for you.

**What to send:**

```json
{
  "url": "https://example.com/very/long/url",
  "validity": 30,
  "shortcode": "custom123"
}
```

**Parameters:**

- `url` (required): The original URL you want to shorten
- `validity` (optional): How long the short URL should work, in minutes (default is 30 minutes)
- `shortcode` (optional): Your own custom short code (must be 3-20 letters and numbers)

**What you get back (201 status):**

```json
{
  "shortcode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "http://localhost:3000/abc123",
  "expiry": "2025-08-01T15:30:00.000Z",
  "createdAt": "2025-08-01T15:00:00.000Z"
}
```

**If something goes wrong:**

- `400`: Your URL isn't valid or you're missing required information
- `409`: Someone else is already using that custom short code

#### Getting statistics for a short URL

**GET** `/shorturls/:shortcode`

This shows you how many times your short URL has been clicked and other useful information.

**What you get back (200 status):**

```json
{
  "shortcode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 42,
  "createdAt": "2025-08-01T15:00:00.000Z",
  "expiry": "2025-08-01T15:30:00.000Z",
  "clickData": [
    {
      "timestamp": "2025-08-01T15:05:00.000Z",
      "source": "Mozilla/5.0...",
      "referrer": "https://google.com",
      "location": "192.168.1.1"
    }
  ]
}
```

**If something goes wrong:**

- `404`: That short code doesn't exist or has expired

#### Using a short URL (redirecting)

**GET** `/:shortcode`

When someone visits your short URL, they automatically get redirected to the original URL. We also keep track of this click for your statistics.

**What happens:**

- `302`: Redirects to the original URL
- `404`: That short code doesn't exist or has expired

## Examples

### Creating a short URL

```bash
curl -X POST http://localhost:3000/shorturls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www. .com/very/long/path/to/resource",
    "validity": 60,
    "shortcode": "afford123"
  }'
```

### Getting click statistics

```bash
curl http://localhost:3000/shorturls/afford123
```

### Testing the redirect

```bash
curl -L http://localhost:3000/afford123
```

## Project Structure

Here's how the code is organized:

```
Backend/
├── src/
│   ├── app.js                 # Main Express app setup
│   ├── middleware/
│   │   └── logging.js         # Handles logging to external service
│   ├── models/
│   │   └── url.js             # Manages URL data and storage
│   ├── routes/
│   │   └── shorturl.js        # API routes for URL operations
│   └── utils/
│       └── shortcode.js       # Generates and validates short codes
├── test-server.js             # Starts the server
├── package.json               # Project info and dependencies
└── README.md                  # This file
```

### What each part does

- **`app.js`**: Sets up the Express server and connects all the middleware
- **`logging.js`**: Sends logs to an external service and handles errors gracefully
- **`url.js`**: Stores URLs in memory and tracks click data
- **`shorturl.js`**: Handles the API endpoints for creating and managing short URLs
- **`shortcode.js`**: Creates random short codes and validates custom ones

## Logging

The app logs everything important to an external evaluation service. This helps with monitoring and debugging, but if the logging service is down, the app keeps working normally.

What gets logged:

- When the server starts and stops
- Every API request that comes in
- When URLs are created or accessed
- Any errors that happen

The logs are categorized as:

- `service`: Server lifecycle events
- `route`: HTTP requests
- `handler`: Processing and validation
- `error`: When things go wrong

## Development

### Working on the code

To run the server in development mode (it automatically restarts when you change files):

```bash
npm run dev
```

### Code guidelines

Try to follow these practices:

- Use modern JavaScript (ES6+)
- Handle errors properly with try/catch
- Add meaningful log messages
- Write code that's easy to understand

### Security features

The app includes several security measures:

- **Helmet**: Adds security headers to HTTP responses
- **CORS**: Controls which domains can access the API
- **Input validation**: Checks that URLs are valid and parameters make sense
- **Error handling**: Returns helpful error messages without exposing sensitive information

## Testing

### Testing manually

1. **Start the server**

   ```bash
   npm start
   ```

2. **Create a short URL**

   ```bash
   curl -X POST http://localhost:3000/shorturls \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   ```

3. **Test the redirect**

   ```bash
   curl -L http://localhost:3000/{shortcode}
   ```

4. **Check the statistics**
   ```bash
   curl http://localhost:3000/shorturls/{shortcode}
   ```

### What should happen

- Short URLs should redirect to the original URLs
- Click counts should increase each time someone uses a short URL
- Expired URLs should return a 404 error
- Invalid requests should return helpful error messages

## How it all works

1. **Creating URLs**: You send a POST request → we validate it → generate a short code → store it → send back the short URL
2. **Using URLs**: Someone clicks the short URL → we look it up → check if it's expired → record the click → redirect them
3. **Getting stats**: You ask for statistics → we look up the data → send back click information

<img width="1362" height="892" alt="s1" src="https://github.com/user-attachments/assets/4cdc8b80-7e99-479a-9b50-420cd8267d83" />
<img width="1376" height="842" alt="s2" src="https://github.com/user-attachments/assets/b854ae56-1101-4c0e-9af8-776ae94cabcb" />
<img width="1357" height="858" alt="s3" src="https://github.com/user-attachments/assets/01f8f10a-ec7c-4672-a942-8beb3075ae38" />






