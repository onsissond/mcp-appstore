/**
 * Cross-platform verification test for App Store Scraper MCP server
 * 
 * This script tests each tool on both iOS and Android platforms
 * to ensure proper functionality across platforms.
 */

import { Client } from './node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from './node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';

// Test configuration
const ANDROID_APP_ID = 'com.spotify.music';
const IOS_APP_ID = '324684580'; // Spotify App Store ID 
const IOS_APP_ID_REVIEWS = '284882215'; // Facebook App - confirmed working for reviews
const SEARCH_TERM = 'fitness tracker';
const TEST_TIMEOUT = 120000; // 2 minutes timeout

/**
 * Run platform-specific tests for all tools
 */
async function runPlatformTests() {
  let client = null;
  let transport = null;
  
  console.log('Starting cross-platform verification tests...');
  
  try {
    // Start the server and connect the client
    console.log('Connecting to MCP server...');
    transport = new StdioClientTransport({
      command: "node",
      args: ["server.js"]
    });
    
    client = new Client(
      {
        name: "app-store-test-client",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    await client.connect(transport);
    console.log('Connected to MCP server.\n');
    
    // Test 1: get_app_details on Android
    console.log('=== Test 1: get_app_details on Android ===');
    try {
      const androidResult = await client.callTool({
        name: "get_app_details",
        arguments: {
          appId: ANDROID_APP_ID,
          platform: "android"
        }
      });
      
      const androidData = JSON.parse(androidResult.content[0].text);
      console.log(`App Title: ${androidData.details.title}`);
      console.log(`Developer: ${androidData.details.developer}`);
      console.log(`Rating: ${androidData.details.score}`);
      console.log(`Category: ${androidData.details.genre}`);
      console.log('✅ get_app_details on Android successful\n');
    } catch (error) {
      console.error('❌ get_app_details on Android failed:', error.message);
    }
    
    // Test 2: get_app_details on iOS
    console.log('=== Test 2: get_app_details on iOS ===');
    try {
      const iosResult = await client.callTool({
        name: "get_app_details",
        arguments: {
          appId: IOS_APP_ID,
          platform: "ios"
        }
      });
      
      const iosData = JSON.parse(iosResult.content[0].text);
      console.log(`App Title: ${iosData.details.title}`);
      console.log(`Developer: ${iosData.details.developer}`);
      console.log(`Rating: ${iosData.details.score}`);
      console.log(`Category: ${iosData.details.primaryGenre}`);
      console.log('✅ get_app_details on iOS successful\n');
    } catch (error) {
      console.error('❌ get_app_details on iOS failed:', error.message);
    }
    
    // Test 3: analyze_top_keywords on Android
    console.log('=== Test 3: analyze_top_keywords on Android ===');
    try {
      const androidKeywords = await client.callTool({
        name: "analyze_top_keywords",
        arguments: {
          keyword: SEARCH_TERM,
          platform: "android",
          num: 5
        }
      });
      
      const androidData = JSON.parse(androidKeywords.content[0].text);
      console.log(`Keyword Analyzed: ${androidData.keyword}`);
      console.log(`Number of Apps Found: ${androidData.topApps.length}`);
      console.log(`Top Brands: ${androidData.brandPresence.topBrands.join(', ')}`);
      console.log(`Competition Level: ${androidData.brandPresence.competitionLevel}`);
      console.log(`Average Rating: ${androidData.metrics.averageRating}`);
      console.log('✅ analyze_top_keywords on Android successful\n');
    } catch (error) {
      console.error('❌ analyze_top_keywords on Android failed:', error.message);
    }
    
    // Test 4: analyze_top_keywords on iOS
    console.log('=== Test 4: analyze_top_keywords on iOS ===');
    try {
      const iosKeywords = await client.callTool({
        name: "analyze_top_keywords",
        arguments: {
          keyword: SEARCH_TERM,
          platform: "ios",
          num: 5
        }
      });
      
      const iosData = JSON.parse(iosKeywords.content[0].text);
      console.log(`Keyword Analyzed: ${iosData.keyword}`);
      console.log(`Number of Apps Found: ${iosData.topApps.length}`);
      console.log(`Top Brands: ${iosData.brandPresence.topBrands.join(', ')}`);
      console.log(`Competition Level: ${iosData.brandPresence.competitionLevel}`);
      console.log(`Average Rating: ${iosData.metrics.averageRating}`);
      console.log('✅ analyze_top_keywords on iOS successful\n');
    } catch (error) {
      console.error('❌ analyze_top_keywords on iOS failed:', error.message);
    }
    
    // Test 5: analyze_reviews on Android
    console.log('=== Test 5: analyze_reviews on Android ===');
    try {
      const androidReviews = await client.callTool({
        name: "analyze_reviews",
        arguments: {
          appId: ANDROID_APP_ID,
          platform: "android",
          num: 50
        }
      });
      
      const androidData = JSON.parse(androidReviews.content[0].text);
      console.log(`Total Reviews Analyzed: ${androidData.totalReviewsAnalyzed}`);
      console.log('Sentiment Breakdown:');
      for (const [sentiment, percentage] of Object.entries(androidData.analysis.sentimentBreakdown)) {
        console.log(`  ${sentiment}: ${percentage}%`);
      }
      console.log('Top Keywords:');
      const topKeywords = Object.entries(androidData.analysis.keywordFrequency).slice(0, 5);
      topKeywords.forEach(([keyword, count]) => {
        console.log(`  ${keyword}: ${count}`);
      });
      console.log('Common Themes:');
      androidData.analysis.commonThemes.forEach(theme => {
        console.log(`  ${theme.theme}: ${theme.description}`);
      });
      console.log('✅ analyze_reviews on Android successful\n');
    } catch (error) {
      console.error('❌ analyze_reviews on Android failed:', error.message);
    }
    
    // Test 6: analyze_reviews on iOS
    console.log('=== Test 6: analyze_reviews on iOS ===');
    try {
      const iosReviews = await client.callTool({
        name: "analyze_reviews",
        arguments: {
          appId: IOS_APP_ID_REVIEWS,
          platform: "ios",
          num: 50
        }
      });
      
      const iosData = JSON.parse(iosReviews.content[0].text);
      console.log(`Total Reviews Analyzed: ${iosData.totalReviewsAnalyzed}`);
      console.log('Sentiment Breakdown:');
      for (const [sentiment, percentage] of Object.entries(iosData.analysis.sentimentBreakdown)) {
        console.log(`  ${sentiment}: ${percentage}%`);
      }
      console.log('Top Keywords:');
      const topKeywords = Object.entries(iosData.analysis.keywordFrequency).slice(0, 5);
      topKeywords.forEach(([keyword, count]) => {
        console.log(`  ${keyword}: ${count}`);
      });
      console.log('Common Themes:');
      iosData.analysis.commonThemes.forEach(theme => {
        console.log(`  ${theme.theme}: ${theme.description}`);
      });
      console.log('✅ analyze_reviews on iOS successful\n');
    } catch (error) {
      console.error('❌ analyze_reviews on iOS failed:', error.message);
    }
    
    // Overall results
    console.log('===== Cross-Platform Test Summary =====');
    console.log('All tools have been tested on both Android and iOS platforms.');
    console.log('Check the output above for any failures.');
    
  } catch (error) {
    console.error('Error during test execution:', error);
  } finally {
    // Disconnect from the server if connected
    if (client) {
      console.log('\nDisconnecting from server...');
      try {
        await client.close();
      } catch (e) {
        console.error('Error during disconnect:', e.message);
      }
      console.log('Disconnected from server.');
    }
  }
}

// Set a timeout for the entire test suite
const testTimeout = setTimeout(() => {
  console.error('Test suite timed out after', TEST_TIMEOUT, 'ms');
  process.exit(1);
}, TEST_TIMEOUT);

// Run the tests and clear the timeout when done
runPlatformTests().finally(() => clearTimeout(testTimeout)); 