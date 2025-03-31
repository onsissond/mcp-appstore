/**
 * Test client for App Store Scraper MCP server
 * 
 * This client demonstrates how to connect to and use the App Store Scraper MCP server.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Get absolute paths to modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sdkPath = path.resolve(__dirname, 'node_modules/@modelcontextprotocol/sdk/dist/esm');

// Import MCP modules dynamically
const { McpClient } = await import(path.join(sdkPath, 'client/mcp.js'));
const { StdioClientTransport } = await import(path.join(sdkPath, 'client/stdio.js'));

async function main() {
  try {
    console.log("Creating client transport...");
    const transport = new StdioClientTransport("server.js");
    
    console.log("Connecting to MCP server...");
    const client = new McpClient();
    await client.connect(transport);
    
    console.log("Connected to MCP server!");
    
    // Get the server configuration
    const config = await client.getConfig();
    console.log("Server configuration:", config);
    
    // Get available tools
    const tools = await client.getTools();
    console.log("Available tools:", tools);
    
    // Example: Search for an app
    console.log("\nSearching for 'Netflix' on Android...");
    const searchResult = await client.invoke("search_app", {
      term: "Netflix",
      platform: "android",
      num: 3
    });
    
    console.log("Search results:", searchResult);
    
    // Disconnect from the server
    console.log("\nDisconnecting from server...");
    await client.disconnect();
    console.log("Disconnected from server.");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main(); 