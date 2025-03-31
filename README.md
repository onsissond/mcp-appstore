# App Store Scraper MCP Server

This is an MCP (Model Context Protocol) server that provides tools for searching and analyzing apps from both Google Play Store and Apple App Store.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd app-store-scraper-mcp

# Install dependencies
npm install
```

## Running the Server

```bash
npm start
```

This will start the server in stdio mode, which is compatible with MCP clients.

## Available Tools

The server provides the following tools:

### 1. search_app

Search for apps by name and platform.

**Parameters:**
- `term`: The search term to look up
- `platform`: The platform to search on (`ios` or `android`)
- `num` (optional): Number of results to return (default: 10, max: 250)
- `country` (optional): Two-letter country code (default: "us")

**Example usage:**
```javascript
const result = await client.callTool({
  name: "search_app",
  arguments: {
    term: "spotify",
    platform: "android",
    num: 5
  }
});
```

**Response:**
```json
{
  "query": "spotify",
  "platform": "android",
  "results": [
    {
      "id": "com.spotify.music",
      "appId": "com.spotify.music",
      "title": "Spotify: Music and Podcasts",
      "developer": "Spotify AB",
      "developerId": "Spotify+AB",
      "icon": "https://play-lh.googleusercontent.com/...",
      "score": 4.3,
      "scoreText": "4.3",
      "price": 0,
      "free": true,
      "platform": "android",
      "url": "https://play.google.com/store/apps/details?id=com.spotify.music"
    },
    // Additional results...
  ],
  "count": 5
}
```

### 2. get_app_details

Get detailed information about an app by ID.

**Parameters:**
- `appId`: The unique app ID (com.example.app for Android or numeric ID/bundleId for iOS)
- `platform`: The platform of the app (`ios` or `android`)
- `country` (optional): Two-letter country code (default: "us")
- `lang` (optional): Language code for the results (default: "en")

**Example usage:**
```javascript
const result = await client.callTool({
  name: "get_app_details",
  arguments: {
    appId: "com.spotify.music",
    platform: "android"
  }
});
```

**Response:**
```json
{
  "appId": "com.spotify.music",
  "platform": "android",
  "details": {
    "id": "com.spotify.music",
    "appId": "com.spotify.music",
    "title": "Spotify: Music and Podcasts",
    "description": "With Spotify, you can play millions of songs and podcasts for free...",
    "summary": "Listen to songs, podcasts, and playlists for free...",
    "developer": "Spotify AB",
    "developerId": "Spotify+AB",
    "developerEmail": "androidapp@spotify.com",
    "developerWebsite": "https://www.spotify.com/",
    "icon": "https://play-lh.googleusercontent.com/...",
    "headerImage": "https://play-lh.googleusercontent.com/...",
    "screenshots": ["https://play-lh.googleusercontent.com/...", "..."],
    "score": 4.3,
    "scoreText": "4.3",
    "ratings": 15678956,
    "reviews": 4567890,
    "histogram": {
      "1": 567890,
      "2": 234567,
      "3": 890123,
      "4": 2345678,
      "5": 11640698
    },
    "price": 0,
    "free": true,
    "currency": "USD",
    "categories": [
      { "name": "Music & Audio", "id": "MUSIC_AND_AUDIO" }
    ],
    "genre": "Music & Audio",
    "genreId": "MUSIC_AND_AUDIO",
    "contentRating": "Teen",
    "updated": 1648234567890,
    "version": "8.7.30.1356",
    "size": "30M",
    "recentChanges": "We're always making changes and improvements to Spotify...",
    "platform": "android"
  }
}
```

### 3. analyze_top_keywords

Analyze top keywords for apps including brand analysis and competition metrics.

**Parameters:**
- `keyword`: The keyword to analyze
- `platform`: The platform to analyze (`ios` or `android`)
- `country` (optional): Two-letter country code (default: "us")
- `lang` (optional): Language code for the results (default: "en")
- `num` (optional): Number of apps to analyze (default: 10, max: 50)

**Example usage:**
```javascript
const result = await client.callTool({
  name: "analyze_top_keywords",
  arguments: {
    keyword: "fitness tracker",
    platform: "ios",
    num: 10
  }
});
```

**Response:**
```json
{
  "keyword": "fitness tracker",
  "platform": "ios",
  "topApps": [
    {
      "appId": "com.fitbit.FitbitMobile",
      "title": "Fitbit: Health & Fitness",
      "developer": "Fitbit, Inc.",
      "developerId": "347935733",
      "score": 4.5,
      "ratings": 238456,
      "free": true,
      "price": 0,
      "currency": "USD",
      "category": "Health & Fitness",
      "url": "https://apps.apple.com/us/app/fitbit/id...",
      "icon": "https://is1-ssl.mzstatic.com/..."
    },
    // Additional apps...
  ],
  "brandPresence": {
    "topBrands": ["Fitbit, Inc.", "Garmin"],
    "brandDominance": 0.45,
    "competitionLevel": "Medium - mix of major brands and independents"
  },
  "metrics": {
    "totalApps": 10,
    "averageRating": 4.2,
    "paidAppsPercentage": 30.0,
    "categoryDistribution": {
      "Health & Fitness": 8,
      "Lifestyle": 2
    }
  }
}
```

### 4. analyze_reviews

Analyze app reviews and ratings to extract user sentiment and key insights.

**Parameters:**
- `appId`: The unique app ID (com.example.app for Android or numeric ID/bundleId for iOS)
- `platform`: The platform of the app (`ios` or `android`)
- `country` (optional): Two-letter country code (default: "us")
- `lang` (optional): Language code for the results (default: "en")
- `sort` (optional): How to sort the reviews (`newest`, `rating`, `helpfulness`) (default: "newest")
- `num` (optional): Number of reviews to analyze (default: 100, max: 1000)

**Example usage:**
```javascript
const result = await client.callTool({
  name: "analyze_reviews",
  arguments: {
    appId: "com.spotify.music",
    platform: "android",
    sort: "helpfulness",
    num: 200
  }
});
```

**Response:**
```json
{
  "appId": "com.spotify.music",
  "platform": "android",
  "totalReviewsAnalyzed": 200,
  "analysis": {
    "sentimentBreakdown": {
      "positive": 62.5,
      "somewhat positive": 15.0,
      "neutral": 10.0,
      "somewhat negative": 7.5,
      "negative": 5.0
    },
    "keywordFrequency": {
      "music": 89,
      "playlist": 76,
      "premium": 65,
      "offline": 43,
      "podcasts": 38,
      "shuffle": 27,
      "recommend": 25,
      "interface": 21,
      "free": 19,
      "account": 18
    },
    "ratingDistribution": {
      "1": 10,
      "2": 15,
      "3": 20,
      "4": 55,
      "5": 100
    },
    "commonThemes": [
      {
        "theme": "User Experience",
        "description": "Users are commenting on the app's design or usability"
      },
      {
        "theme": "Pricing Concerns",
        "description": "Users are discussing price or subscription costs"
      }
    ],
    "recentIssues": {
      "premium": 12,
      "account": 8,
      "login": 7,
      "crash": 5,
      "error": 4
    },
    "topPositiveKeywords": {
      "music": 65,
      "playlist": 48,
      "recommend": 22,
      "discover": 18,
      "variety": 15
    },
    "topNegativeKeywords": {
      "premium": 18,
      "shuffle": 12,
      "advertisements": 10,
      "connect": 8,
      "subscription": 7
    }
  }
}
```

## Connecting with MCP Clients

You can connect to this server using any MCP client. Here's an example using the MCP TypeScript SDK:

```javascript
import { Client } from "@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});

const client = new Client(
  {
    name: "app-store-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

await client.connect(transport);

// Call a tool
const result = await client.callTool({
  name: "search_app",
  arguments: {
    term: "spotify",
    platform: "android",
    num: 5
  }
});

console.log(JSON.parse(result.content[0].text));
```

## Performance Considerations

- The server uses memoization to cache API responses for 10 minutes to reduce external API calls
- For large numbers of reviews or extensive keyword analysis, expect longer response times
- The server includes rate limiting protection to avoid triggering API restrictions

## Dependencies

This server uses the following libraries:
- [google-play-scraper](https://github.com/facundoolano/google-play-scraper)
- [app-store-scraper](https://github.com/facundoolano/app-store-scraper)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

## License

MIT
