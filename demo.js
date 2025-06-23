/**
 * Demo client for App Store Scraper MCP server
 * 
 * This script demonstrates how to use all four tools provided by the MCP server:
 * - search_app
 * - get_app_details
 * - analyze_top_keywords
 * - analyze_reviews
 */

import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  let client = null;
  
  try {
    console.log("🚀 Starting App Store Scraper Demo");
    console.log("----------------------------------");
    
    // Connect to the MCP server
    console.log("\n📱 Connecting to MCP server...");
    const transport = new StdioClientTransport({ command: "node", args: ["server.js"] });
    client = new McpClient({ name: "DemoClient", version: "1.0.0" });
    await client.connect(transport);
    
    console.log("✅ Connected to server");
    
    // Get server configuration and available tools
    const config = await client.getServerVersion();
    console.log("\n🔍 Server Information:");
    console.log(`   Name: ${config.name}`);
    console.log(`   Version: ${config.version}`);
    console.log(`   Description: ${config.description}`);
    
    const listToolsResult = await client.listTools();
    const tools = listToolsResult.tools;
    console.log("\n🧰 Available Tools:");
    tools.forEach(tool => {
      console.log(`   - ${tool.name}`);
    });
    
    // Demo 1: Search for an app
    console.log("\n\n📋 DEMO 1: Searching for Apps");
    console.log("---------------------------");
    console.log("Searching for 'Spotify' on Android...");
    
    const searchResult = await client.callTool({
      name: "search_app",
      arguments: {
        term: "Spotify",
        platform: "android",
        num: 3
      }
    });
    
    const searchData = JSON.parse(searchResult.content[0].text);
    console.log(`Found ${searchData.count} results for '${searchData.query}' on ${searchData.platform}`);
    console.log("Top 3 results:");
    
    searchData.results.forEach((app, index) => {
      console.log(`${index + 1}. ${app.title} by ${app.developer} (Rating: ${app.score})`);
    });
    
    // Demo 2: Get app details
    console.log("\n\n📱 DEMO 2: Getting App Details");
    console.log("---------------------------");
    
    // Get the appId from the search results
    const appId = searchData.results[0].appId;
    console.log(`Getting details for '${searchData.results[0].title}' (${appId})...`);
    
    const detailsResult = await client.callTool({
      name: "get_app_details",
      arguments: {
        appId: appId,
        platform: "android"
      }
    });
    
    const detailsData = JSON.parse(detailsResult.content[0].text);
    const appDetails = detailsData.details;
    
    console.log("\nApp Details:");
    console.log(`Title: ${appDetails.title}`);
    console.log(`Developer: ${appDetails.developer}`);
    console.log(`Rating: ${appDetails.score} (${appDetails.ratings} ratings)`);
    console.log(`Installs: ${appDetails.installs}`);
    console.log(`Updated: ${appDetails.updated}`);
    console.log(`Version: ${appDetails.version}`);
    console.log(`Size: ${appDetails.size}`);
    
    // Demo 3: Analyze top keywords
    console.log("\n\n🔎 DEMO 3: Keyword Analysis");
    console.log("---------------------------");
    console.log("Analyzing keyword 'music streaming' on Android...");
    
    const keywordResult = await client.callTool({
      name: "analyze_top_keywords",
      arguments: {
        keyword: "music streaming",
        platform: "android",
        num: 5
      }
    });
    
    const keywordData = JSON.parse(keywordResult.content[0].text);
    
    console.log(`\nAnalysis for keyword '${keywordData.keyword}' on ${keywordData.platform}:`);
    console.log("\nTop apps:");
    keywordData.topApps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.title} by ${app.developer} (Installs: ${app.installs || 'Unknown'})`);
    });
    
    console.log("\nBrand presence:");
    console.log(`  Top Brands: ${keywordData.brandPresence.topBrands.join(', ')}`);
    console.log(`  Brand Dominance: ${(keywordData.brandPresence.brandDominance * 100).toFixed(0)}%`);
    console.log(`  Competition Level: ${keywordData.brandPresence.competitionLevel}`);
    
    // Demo 4: Analyze reviews
    console.log("\n\n💬 DEMO 4: Review Analysis");
    console.log("---------------------------");
    console.log(`Analyzing reviews for '${appDetails.title}'...`);
    
    const reviewsResult = await client.callTool({
      name: "analyze_reviews",
      arguments: {
        appId: appId,
        platform: "android",
        num: 50
      }
    });
    
    const reviewsData = JSON.parse(reviewsResult.content[0].text);
    const analysis = reviewsData.analysis;
    
    console.log("\nSentiment breakdown:");
    for (const [sentiment, percentage] of Object.entries(analysis.sentimentBreakdown)) {
      console.log(`- ${sentiment}: ${percentage.toFixed(2)}%`);
    }
    
    console.log("\nTop keywords in reviews:");
    const keywords = Object.entries(analysis.keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
      
    keywords.forEach(([keyword, count], index) => {
      console.log(`${index + 1}. "${keyword}" (mentioned ${count} times)`);
    });
    
    console.log("\nRecent issues mentioned:");
    Object.entries(analysis.recentIssues).forEach(([issue, count]) => {
      console.log(`- "${issue}" (mentioned ${count} times)`);
    });
    
  } catch (error) {
    console.error("Error during demo:", error);
  } finally {
    // Disconnect from the server
    if (client) {
      console.log("\n👋 Disconnecting from server...");
      await client.close();
      console.log("✅ Disconnected successfully");
      console.log("\n📝 Demo completed");
    }
  }
}

main(); 