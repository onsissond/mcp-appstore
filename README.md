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

### 3. analyze_top_keywords

Analyze top keywords for apps including brand analysis and estimated installs.

**Parameters:**
- `keyword`: The keyword to analyze
- `platform`: The platform to analyze (`ios` or `android`)
- `country` (optional): Two-letter country code (default: "us")
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

### 4. analyze_reviews

Analyze app reviews and ratings to extract user satisfaction insights.

**Parameters:**
- `appId`: The unique app ID (com.example.app for Android or numeric ID/bundleId for iOS)
- `platform`: The platform of the app (`ios` or `android`)
- `country` (optional): Two-letter country code (default: "us")
- `lang` (optional): Language code for the results (default: "en")
- `sort` (optional): How to sort the reviews (`newest`, `relevance`, `rating`, `helpful`) (default: "newest")
- `num` (optional): Number of reviews to analyze (default: 100, max: 1000)

**Example usage:**
```javascript
const result = await client.callTool({
  name: "analyze_reviews",
  arguments: {
    appId: "com.spotify.music",
    platform: "android",
    sort: "helpful",
    num: 200
  }
});
```

## Connecting with MCP Clients

You can connect to this server using any MCP client. Here's an example using the MCP TypeScript SDK:

```javascript
import { Client } from "@modelcontextprotocol/sdk/dist/esm/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/dist/esm/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["app-store-mcp-server.js"]
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

## Dependencies

This server uses the following libraries:
- [google-play-scraper](https://github.com/facundoolano/google-play-scraper)
- [app-store-scraper](https://github.com/facundoolano/app-store-scraper)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

## License

MIT
