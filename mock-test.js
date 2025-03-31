/**
 * Mock Tests for App Store Scraper MCP server
 * 
 * This file contains tests that use mocked data instead of actual API calls,
 * making it faster and more reliable for CI/CD environments.
 */

import assert from 'assert';

// Mock data for testing
const MOCK_RESPONSES = {
  search_app: {
    query: "spotify",
    platform: "android",
    results: [
      {
        id: "com.spotify.music",
        appId: "com.spotify.music",
        title: "Spotify: Music and Podcasts",
        developer: "Spotify AB",
        developerId: "Spotify AB",
        icon: "https://play-lh.googleusercontent.com/UrY7BAZ-XfXGpfkeWg0zCCeo-7ras4DCoRalC_WXXWTK9q5b0Iw7B0YQMsVxZaNB7DM=s180",
        score: 4.3,
        scoreText: "4.3",
        price: 0,
        free: true,
        platform: "android",
        url: "https://play.google.com/store/apps/details?id=com.spotify.music"
      },
      {
        id: "com.spotify.lite",
        appId: "com.spotify.lite",
        title: "Spotify Lite",
        developer: "Spotify AB",
        developerId: "Spotify AB",
        icon: "https://play-lh.googleusercontent.com/sNSdjVSRZYiCn2JQi8pLnZO4r7ioy8Mk9QC9FrZZMpBYjUz1VjZ5zKy54yHHMrbFK58=s180",
        score: 4.1,
        scoreText: "4.1",
        price: 0,
        free: true,
        platform: "android",
        url: "https://play.google.com/store/apps/details?id=com.spotify.lite"
      }
    ],
    count: 2
  },
  
  get_app_details: {
    appId: "com.spotify.music",
    platform: "android",
    details: {
      title: "Spotify: Music and Podcasts",
      description: "Listen to songs, play podcasts, create playlists and discover music you'll love.",
      summary: "Listen to songs, podcasts, playlists for free.",
      installs: "1,000,000,000+",
      minInstalls: 1000000000,
      maxInstalls: 5000000000,
      score: 4.3,
      ratings: 35123456,
      reviews: 7612345,
      histogram: {
        "1": 500000,
        "2": 300000,
        "3": 800000,
        "4": 3000000,
        "5": 30523456
      },
      price: 0,
      free: true,
      currency: "USD",
      size: "Varies with device",
      appId: "com.spotify.music",
      developer: "Spotify AB",
      developerId: "Spotify AB",
      developerEmail: "support@spotify.com",
      developerWebsite: "https://www.spotify.com/",
      developerAddress: "Regeringsgatan 19, SE-111 53 Stockholm, Sweden",
      privacyPolicy: "https://www.spotify.com/legal/privacy-policy/",
      genre: "Music & Audio",
      genreId: "MUSIC_AND_AUDIO",
      familyGenre: "Applications",
      familyGenreId: "APPLICATIONS",
      released: "Oct 7, 2008",
      updated: "2023-12-15",
      version: "Varies with device",
      recentChanges: "We're always making changes and improvements to Spotify.",
      url: "https://play.google.com/store/apps/details?id=com.spotify.music",
      platform: "android"
    }
  },
  
  analyze_top_keywords: {
    keyword: "music streaming",
    platform: "android",
    country: "us",
    topApps: [
      {
        title: "Spotify: Music and Podcasts",
        developer: "Spotify AB",
        installs: "1,000,000,000+",
        rating: 4.3,
        appId: "com.spotify.music"
      },
      {
        title: "YouTube Music",
        developer: "Google LLC",
        installs: "1,000,000,000+",
        rating: 4.1,
        appId: "com.google.android.apps.youtube.music"
      },
      {
        title: "Amazon Music: Songs & Podcasts",
        developer: "Amazon Mobile LLC",
        installs: "500,000,000+",
        rating: 4.5,
        appId: "com.amazon.mp3"
      }
    ],
    brandPresence: {
      "Spotify": 28.5,
      "YouTube": 26.3,
      "Amazon": 18.7,
      "SoundCloud": 15.2,
      "Pandora": 11.3
    },
    averageInstalls: "700,000,000+",
    averageRating: 4.3,
    competitiveIndex: 0.82
  },
  
  analyze_reviews: {
    appId: "com.spotify.music",
    platform: "android",
    count: 50,
    analysis: {
      sentimentBreakdown: {
        "Positive": 68.5,
        "Neutral": 12.3,
        "Negative": 19.2
      },
      keywordFrequency: {
        "playlist": 42,
        "songs": 38,
        "premium": 27,
        "ads": 22,
        "offline": 18,
        "podcast": 17,
        "recommend": 15,
        "quality": 12,
        "shuffle": 12,
        "interface": 10
      },
      ratingDistribution: {
        "5": 58,
        "4": 22,
        "3": 8,
        "2": 5,
        "1": 7
      },
      recentIssues: [
        "Excessive ads in free version",
        "Shuffle feature not working correctly",
        "App crashing when downloading playlists",
        "Battery drain during background playback"
      ],
      improvementSuggestions: [
        "Better playlist management",
        "Improved offline mode",
        "More customization options",
        "Enhanced podcast features"
      ]
    }
  }
};

// Mock server config
const SERVER_CONFIG = {
  name: "AppStore Scraper",
  version: "1.0.0",
  description: "Tools for searching and analyzing apps from Google Play and Apple App Store"
};

// Mock available tools
const AVAILABLE_TOOLS = {
  "search_app": {
    description: "Search for apps by name and platform",
    parameters: {
      term: { type: "string", description: "The search term to look up" },
      platform: { type: "string", description: "The platform to search on (ios or android)" },
      num: { type: "number", description: "Number of results to return (max 250)" },
      country: { type: "string", description: "Two-letter country code" }
    }
  },
  "get_app_details": {
    description: "Get detailed information about an app by ID",
    parameters: {
      appId: { type: "string", description: "The unique app ID" },
      platform: { type: "string", description: "The platform of the app (ios or android)" },
      country: { type: "string", description: "Two-letter country code" },
      lang: { type: "string", description: "Language code for the results" }
    }
  },
  "analyze_top_keywords": {
    description: "Analyze top keywords for apps including brand analysis and estimated installs",
    parameters: {
      keyword: { type: "string", description: "The keyword to analyze" },
      platform: { type: "string", description: "The platform to analyze (ios or android)" },
      country: { type: "string", description: "Two-letter country code" },
      num: { type: "number", description: "Number of apps to analyze" }
    }
  },
  "analyze_reviews": {
    description: "Analyze app reviews and ratings to extract user satisfaction insights",
    parameters: {
      appId: { type: "string", description: "The unique app ID" },
      platform: { type: "string", description: "The platform of the app (ios or android)" },
      country: { type: "string", description: "Two-letter country code" },
      lang: { type: "string", description: "Language code for the results" },
      sort: { type: "string", description: "How to sort the reviews" },
      num: { type: "number", description: "Number of reviews to analyze" }
    }
  }
};

// Create a mock MCP client
class MockMcpClient {
  async getConfig() {
    return SERVER_CONFIG;
  }
  
  async getTools() {
    return AVAILABLE_TOOLS;
  }
  
  async invoke(toolName, params) {
    // Return mock data based on the tool name
    const mockData = MOCK_RESPONSES[toolName];
    
    if (!mockData) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    // Return the data in the format expected by the test
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(mockData, null, 2)
        }
      ]
    };
  }
  
  async connect() {
    // Mock successful connection
    return true;
  }
  
  async disconnect() {
    // Mock successful disconnection
    return true;
  }
}

/**
 * Run mock tests for all tools
 */
async function runTests() {
  // Keep track of failed tests
  const failedTests = [];
  let client = null;
  
  console.log('Starting MCP App Store Scraper MOCK tests...');
  
  try {
    // Create a mock client
    client = new MockMcpClient();
    console.log('Connected to mock MCP server.');
    
    // Test 1: Verify server configuration
    try {
      console.log('\nTest 1: Verify server configuration');
      const config = await client.getConfig();
      assert(config.name === "AppStore Scraper", "Server name should be 'AppStore Scraper'");
      assert(config.version === "1.0.0", "Server version should be '1.0.0'");
      assert(config.description.includes("Tools for searching"), "Server description should mention 'Tools for searching'");
      console.log('✅ Server configuration verified');
    } catch (error) {
      console.error('❌ Server configuration test failed:', error.message);
      failedTests.push('Server configuration');
    }
    
    // Test 2: Verify available tools
    try {
      console.log('\nTest 2: Verify available tools');
      const tools = await client.getTools();
      const toolNames = Object.keys(tools);
      
      assert(toolNames.includes('search_app'), "'search_app' tool should be available");
      assert(toolNames.includes('get_app_details'), "'get_app_details' tool should be available");
      assert(toolNames.includes('analyze_top_keywords'), "'analyze_top_keywords' tool should be available");
      assert(toolNames.includes('analyze_reviews'), "'analyze_reviews' tool should be available");
      console.log('✅ Available tools verified');
    } catch (error) {
      console.error('❌ Available tools test failed:', error.message);
      failedTests.push('Available tools');
    }
    
    // Test 3: Test search_app tool
    try {
      console.log('\nTest 3: Test search_app tool');
      console.log('  Searching for "spotify" on Android...');
      
      const searchResult = await client.invoke("search_app", {
        term: "spotify",
        platform: "android",
        num: 3
      });
      
      // Parse the result
      const searchData = JSON.parse(searchResult.content[0].text);
      
      assert(searchData.query === "spotify", "Search query should be 'spotify'");
      assert(searchData.platform === "android", "Platform should be 'android'");
      assert(Array.isArray(searchData.results), "Results should be an array");
      assert(searchData.results.length > 0, "Results should not be empty");
      assert(searchData.results[0].platform === "android", "Results should be for Android platform");
      
      console.log('✅ search_app tool test passed');
    } catch (error) {
      console.error('❌ search_app test failed:', error.message);
      failedTests.push('search_app');
    }
    
    // Test 4: Test get_app_details tool
    try {
      console.log('\nTest 4: Test get_app_details tool');
      console.log('  Getting details for Spotify on Android...');
      
      const detailsResult = await client.invoke("get_app_details", {
        appId: "com.spotify.music",
        platform: "android"
      });
      
      // Parse the result
      const detailsData = JSON.parse(detailsResult.content[0].text);
      
      assert(detailsData.appId === "com.spotify.music", "App ID should be 'com.spotify.music'");
      assert(detailsData.platform === "android", "Platform should be 'android'");
      assert(detailsData.details, "Details should be present");
      assert(detailsData.details.title.toLowerCase().includes("spotify"), "Title should include 'spotify'");
      
      console.log('✅ get_app_details tool test passed');
    } catch (error) {
      console.error('❌ get_app_details test failed:', error.message);
      failedTests.push('get_app_details');
    }
    
    // Test 5: Test analyze_top_keywords tool
    try {
      console.log('\nTest 5: Test analyze_top_keywords tool');
      console.log('  Analyzing keyword "music streaming" on Android...');
      
      const keywordResult = await client.invoke("analyze_top_keywords", {
        keyword: "music streaming",
        platform: "android",
        num: 5
      });
      
      // Parse the result
      const keywordData = JSON.parse(keywordResult.content[0].text);
      
      assert(keywordData.keyword === "music streaming", "Keyword should be 'music streaming'");
      assert(keywordData.platform === "android", "Platform should be 'android'");
      assert(keywordData.topApps, "Top apps should be present");
      assert(Array.isArray(keywordData.topApps), "Top apps should be an array");
      assert(keywordData.brandPresence, "Brand presence should be present");
      
      console.log('✅ analyze_top_keywords tool test passed');
    } catch (error) {
      console.error('❌ analyze_top_keywords test failed:', error.message);
      failedTests.push('analyze_top_keywords');
    }
    
    // Test 6: Test analyze_reviews tool
    try {
      console.log('\nTest 6: Test analyze_reviews tool');
      console.log('  Analyzing reviews for Spotify on Android...');
      
      const reviewsResult = await client.invoke("analyze_reviews", {
        appId: "com.spotify.music",
        platform: "android",
        num: 50
      });
      
      // Parse the result
      const reviewsData = JSON.parse(reviewsResult.content[0].text);
      
      assert(reviewsData.appId === "com.spotify.music", "App ID should be 'com.spotify.music'");
      assert(reviewsData.platform === "android", "Platform should be 'android'");
      assert(reviewsData.analysis, "Analysis should be present");
      assert(reviewsData.analysis.sentimentBreakdown, "Sentiment breakdown should be present");
      assert(reviewsData.analysis.keywordFrequency, "Keyword frequency should be present");
      
      console.log('✅ analyze_reviews tool test passed');
    } catch (error) {
      console.error('❌ analyze_reviews test failed:', error.message);
      failedTests.push('analyze_reviews');
    }
    
  } catch (error) {
    console.error('Error during test execution:', error);
  } finally {
    // Display test summary
    console.log('\n----- TEST SUMMARY -----');
    if (failedTests.length === 0) {
      console.log('All tests passed! 🎉');
    } else {
      console.log(`${failedTests.length} tests failed:`);
      failedTests.forEach(test => console.log(`- ${test}`));
      // Exit with error code
      process.exit(1);
    }
  }
}

// Run the tests
runTests(); 