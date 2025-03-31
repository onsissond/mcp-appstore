/**
 * MCP Server for App Store Scrapers
 * 
 * This server provides tools to search and analyze apps from both
 * Google Play Store and Apple App Store.
 */

import { McpServer } from "@modelcontextprotocol/sdk/dist/esm/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/dist/esm/server/stdio.js";
import { z } from "zod";

// Import the scrapers
import gplay from "google-play-scraper";
import appStore from "app-store-scraper";

// Create an MCP server
const server = new McpServer({
  name: "AppStore Scraper",
  version: "1.0.0",
  description: "Tools for searching and analyzing apps from Google Play and Apple App Store"
});

// Tool 1: Search for an app by name and platform
server.tool(
  "search_app",
  {
    term: z.string().describe("The search term to look up"),
    platform: z.enum(["ios", "android"]).describe("The platform to search on (ios or android)"),
    num: z.number().min(1).max(250).optional().default(10).describe("Number of results to return (max 250)"),
    country: z.string().length(2).optional().default("us").describe("Two-letter country code")
  },
  async ({ term, platform, num, country }) => {
    try {
      let results;
      
      if (platform === "android") {
        // Search on Google Play Store
        results = await gplay.search({
          term,
          num,
          country,
          fullDetail: false
        });
        
        // Standardize the results
        results = results.map(app => ({
          id: app.appId,
          appId: app.appId,
          title: app.title,
          developer: app.developer,
          developerId: app.developerId,
          icon: app.icon,
          score: app.score,
          scoreText: app.scoreText,
          price: app.price,
          free: app.free,
          platform: "android",
          url: app.url
        }));
      } else {
        // Search on Apple App Store
        results = await appStore.search({
          term,
          num,
          country
        });
        
        // Standardize the results
        results = results.map(app => ({
          id: app.id.toString(),
          appId: app.appId,
          title: app.title,
          developer: app.developer,
          developerId: app.developerId,
          icon: app.icon,
          score: app.score,
          price: app.price,
          free: app.free === true,
          platform: "ios",
          url: app.url
        }));
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            query: term,
            platform,
            results,
            count: results.length
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            error: error.message,
            query: term,
            platform
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Tool 2: Get detailed information about an app by ID
server.tool(
  "get_app_details",
  {
    appId: z.string().describe("The unique app ID (com.example.app for Android or numeric ID/bundleId for iOS)"),
    platform: z.enum(["ios", "android"]).describe("The platform of the app (ios or android)"),
    country: z.string().length(2).optional().default("us").describe("Two-letter country code"),
    lang: z.string().optional().default("en").describe("Language code for the results")
  },
  async ({ appId, platform, country, lang }) => {
    try {
      let details;
      
      if (platform === "android") {
        // Get details from Google Play Store
        details = await gplay.app({
          appId: appId,
          country: country,
          lang: lang
        });
        
        // Add platform identifier
        details.platform = "android";
      } else {
        // For iOS, check if the appId is numeric (trackId) or a bundle ID
        const isNumeric = /^\d+$/.test(appId);
        const params = {
          country: country,
          lang: lang
        };
        
        if (isNumeric) {
          params.id = appId;
        } else {
          params.appId = appId;
        }
        
        // Get details from Apple App Store with ratings info
        details = await appStore.app({
          ...params,
          ratings: true
        });
        
        // Add platform identifier
        details.platform = "ios";
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            appId: appId,
            platform: platform,
            details: details
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            error: error.message,
            appId: appId,
            platform: platform
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Tool 3: Analyze top keywords for apps including brand analysis and estimated installs
server.tool(
  "analyze_top_keywords",
  {
    keyword: z.string().describe("The keyword to analyze"),
    platform: z.enum(["ios", "android"]).describe("The platform to analyze (ios or android)"),
    country: z.string().length(2).optional().default("us").describe("Two-letter country code"),
    num: z.number().min(1).max(50).optional().default(10).describe("Number of apps to analyze")
  },
  async ({ keyword, platform, country, num }) => {
    try {
      // First, search for apps with the keyword
      let apps;
      let keywordAnalysis = {
        keyword,
        platform,
        country,
        topApps: [],
        brandPresence: {},
        estimatedPopularity: 0,
        competitionLevel: "",
        avgRating: 0,
        totalInstallsEstimate: 0,
        keywordDifficulty: 0
      };
      
      if (platform === "android") {
        apps = await gplay.search({
          term: keyword,
          num,
          country,
          fullDetail: false
        });
        
        // Get details for top apps
        const appDetailsPromises = apps.slice(0, num).map(app => 
          gplay.app({ appId: app.appId, country, fullDetail: true })
        );
        
        const appDetails = await Promise.all(appDetailsPromises);
        
        // Calculate statistics
        let totalScore = 0;
        let totalInstalls = 0;
        const developers = {};
        
        appDetails.forEach(app => {
          // Store app details
          keywordAnalysis.topApps.push({
            appId: app.appId,
            title: app.title,
            developer: app.developer,
            score: app.score,
            installs: app.minInstalls || 0,
            category: app.genre,
            free: app.free,
            price: app.price
          });
          
          // Track developer frequency (brand presence)
          developers[app.developer] = (developers[app.developer] || 0) + 1;
          
          // Accumulate totals
          totalScore += app.score || 0;
          totalInstalls += app.minInstalls || 0;
        });
        
        // Add aggregate analysis
        keywordAnalysis.brandPresence = Object.entries(developers)
          .sort((a, b) => b[1] - a[1])
          .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {});
        
        keywordAnalysis.avgRating = totalScore / appDetails.length;
        keywordAnalysis.totalInstallsEstimate = totalInstalls;
        
        // Determine competition level based on installs of top apps
        if (totalInstalls > 100000000) {
          keywordAnalysis.competitionLevel = "Very High";
          keywordAnalysis.keywordDifficulty = 9;
        } else if (totalInstalls > 10000000) {
          keywordAnalysis.competitionLevel = "High";
          keywordAnalysis.keywordDifficulty = 7;
        } else if (totalInstalls > 1000000) {
          keywordAnalysis.competitionLevel = "Medium";
          keywordAnalysis.keywordDifficulty = 5;
        } else if (totalInstalls > 100000) {
          keywordAnalysis.competitionLevel = "Low";
          keywordAnalysis.keywordDifficulty = 3;
        } else {
          keywordAnalysis.competitionLevel = "Very Low";
          keywordAnalysis.keywordDifficulty = 1;
        }
        
        // Set popularity based on total installs
        keywordAnalysis.estimatedPopularity = Math.min(Math.round(Math.log10(totalInstalls) - 2), 10);
        if (keywordAnalysis.estimatedPopularity < 0) keywordAnalysis.estimatedPopularity = 0;
        
      } else {
        // iOS analysis
        apps = await appStore.search({
          term: keyword,
          num,
          country
        });
        
        // Get details for top apps
        const appDetailsPromises = apps.slice(0, num).map(app => 
          appStore.app({ id: app.id, country, ratings: true })
        );
        
        const appDetails = await Promise.all(appDetailsPromises);
        
        // Calculate statistics
        let totalScore = 0;
        let totalRatings = 0;
        const developers = {};
        
        appDetails.forEach(app => {
          // Store app details
          keywordAnalysis.topApps.push({
            appId: app.appId,
            id: app.id,
            title: app.title,
            developer: app.developer,
            score: app.score,
            ratings: app.ratings || 0,
            category: app.primaryGenre,
            free: app.free,
            price: app.price
          });
          
          // Track developer frequency (brand presence)
          developers[app.developer] = (developers[app.developer] || 0) + 1;
          
          // Accumulate totals
          totalScore += app.score || 0;
          totalRatings += app.ratings || 0;
        });
        
        // Add aggregate analysis
        keywordAnalysis.brandPresence = Object.entries(developers)
          .sort((a, b) => b[1] - a[1])
          .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {});
        
        keywordAnalysis.avgRating = totalScore / appDetails.length;
        keywordAnalysis.totalRatingsCount = totalRatings;
        
        // Estimate installs based on ratings (very rough estimate: 100 installs per rating)
        const estimatedInstalls = totalRatings * 100;
        keywordAnalysis.totalInstallsEstimate = estimatedInstalls;
        
        // Determine competition level based on estimated installs
        if (estimatedInstalls > 10000000) {
          keywordAnalysis.competitionLevel = "Very High";
          keywordAnalysis.keywordDifficulty = 9;
        } else if (estimatedInstalls > 1000000) {
          keywordAnalysis.competitionLevel = "High";
          keywordAnalysis.keywordDifficulty = 7;
        } else if (estimatedInstalls > 100000) {
          keywordAnalysis.competitionLevel = "Medium";
          keywordAnalysis.keywordDifficulty = 5;
        } else if (estimatedInstalls > 10000) {
          keywordAnalysis.competitionLevel = "Low";
          keywordAnalysis.keywordDifficulty = 3;
        } else {
          keywordAnalysis.competitionLevel = "Very Low";
          keywordAnalysis.keywordDifficulty = 1;
        }
        
        // Set popularity based on total estimated installs
        keywordAnalysis.estimatedPopularity = Math.min(Math.round(Math.log10(estimatedInstalls) - 2), 10);
        if (keywordAnalysis.estimatedPopularity < 0) keywordAnalysis.estimatedPopularity = 0;
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(keywordAnalysis, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            error: error.message,
            keyword,
            platform
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Tool 4: Analyze app reviews and ratings to extract user satisfaction insights
server.tool(
  "analyze_reviews",
  {
    appId: z.string().describe("The unique app ID (com.example.app for Android or numeric ID/bundleId for iOS)"),
    platform: z.enum(["ios", "android"]).describe("The platform of the app (ios or android)"),
    country: z.string().length(2).optional().default("us").describe("Two-letter country code"),
    lang: z.string().optional().default("en").describe("Language code for the results"),
    sort: z.enum(["newest", "relevance", "rating", "helpful"]).optional().default("newest").describe("How to sort the reviews"),
    num: z.number().min(1).max(1000).optional().default(100).describe("Number of reviews to analyze (max 1000)")
  },
  async ({ appId, platform, country, lang, sort, num }) => {
    try {
      let reviewsData;
      let sortMapping = {};
      
      if (platform === "android") {
        // Map the sort parameter to Google Play's sort options
        sortMapping = {
          "newest": gplay.sort.NEWEST,
          "relevance": gplay.sort.RELEVANCE, 
          "rating": gplay.sort.RATING,
          "helpful": gplay.sort.HELPFULNESS
        };
        
        // Get reviews from Google Play Store
        reviewsData = await gplay.reviews({
          appId: appId,
          sort: sortMapping[sort],
          num: num,
          country: country,
          lang: lang
        });
        
        // Get app details to add name and overall rating
        const appDetails = await gplay.app({
          appId: appId,
          country: country,
          lang: lang
        });
        
        // Analyze reviews
        const analysis = analyzeAndroidReviews(reviewsData.data, appDetails);
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(analysis, null, 2)
          }]
        };
        
      } else {
        // Map the sort parameter to App Store's sort options
        sortMapping = {
          "newest": appStore.sort.RECENT,
          "helpful": appStore.sort.HELPFUL,
          // iOS doesn't have rating or relevance sorts, defaulting to recent
          "rating": appStore.sort.RECENT,  
          "relevance": appStore.sort.RECENT
        };
        
        // For iOS, check if the appId is numeric (trackId) or a bundle ID
        const isNumeric = /^\d+$/.test(appId);
        const params = {
          sort: sortMapping[sort],
          page: 1,
          country: country
        };
        
        if (isNumeric) {
          params.id = appId;
        } else {
          params.appId = appId;
        }
        
        // Get app details first
        const appDetails = await appStore.app({
          ...(isNumeric ? {id: appId} : {appId: appId}),
          country: country,
          ratings: true
        });
        
        // Collect reviews - need to make multiple calls to get enough reviews
        const maxPages = Math.min(Math.ceil(num / 50), 10); // App Store limits to 10 pages
        let allReviews = [];
        
        for (let page = 1; page <= maxPages && allReviews.length < num; page++) {
          const pageReviews = await appStore.reviews({
            ...params,
            page: page
          });
          
          allReviews = allReviews.concat(pageReviews);
          
          if (pageReviews.length < 50) {
            break; // No more reviews available
          }
        }
        
        // Limit to requested number
        allReviews = allReviews.slice(0, num);
        
        // Analyze iOS reviews
        const analysis = analyzeIOSReviews(allReviews, appDetails);
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(analysis, null, 2)
          }]
        };
      }
      
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            error: error.message,
            appId: appId,
            platform: platform
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Helper function to analyze Android reviews
function analyzeAndroidReviews(reviews, appDetails) {
  // Count reviews by rating
  const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalScore = 0;
  
  reviews.forEach(review => {
    const rating = Math.round(review.score);
    ratingCount[rating] = (ratingCount[rating] || 0) + 1;
    totalScore += review.score;
  });
  
  // Extract common themes/keywords from review texts
  const keywords = extractReviewKeywords(reviews.map(r => r.text).filter(Boolean));
  
  // Get version-specific feedback
  const versionFeedback = {};
  reviews.forEach(review => {
    if (review.version) {
      if (!versionFeedback[review.version]) {
        versionFeedback[review.version] = {
          count: 0,
          averageScore: 0,
          totalScore: 0,
          keywords: {}
        };
      }
      
      versionFeedback[review.version].count++;
      versionFeedback[review.version].totalScore += review.score;
      
      // Extract keywords for this version
      if (review.text) {
        const versionKeywords = extractReviewKeywords([review.text]);
        Object.keys(versionKeywords).forEach(keyword => {
          versionFeedback[review.version].keywords[keyword] = 
            (versionFeedback[review.version].keywords[keyword] || 0) + versionKeywords[keyword];
        });
      }
    }
  });
  
  // Calculate average scores for each version
  Object.keys(versionFeedback).forEach(version => {
    versionFeedback[version].averageScore = 
      versionFeedback[version].totalScore / versionFeedback[version].count;
    
    // Sort the keywords
    versionFeedback[version].keywords = Object.entries(versionFeedback[version].keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  });
  
  // Positive vs negative reviews
  const sentiment = {
    positive: reviews.filter(r => r.score >= 4).length,
    neutral: reviews.filter(r => r.score === 3).length,
    negative: reviews.filter(r => r.score <= 2).length
  };
  
  // Engagement metrics - thumbs up counts
  const engagement = {
    totalThumbsUp: reviews.reduce((sum, review) => sum + (review.thumbsUp || 0), 0),
    averageThumbsUp: reviews.reduce((sum, review) => sum + (review.thumbsUp || 0), 0) / reviews.length,
    mostHelpfulReview: reviews.sort((a, b) => (b.thumbsUp || 0) - (a.thumbsUp || 0))[0] || null
  };
  
  // Check for recent trend in sentiment
  const recentReviews = reviews.slice(0, Math.min(20, reviews.length));
  const recentSentiment = {
    positive: recentReviews.filter(r => r.score >= 4).length,
    neutral: recentReviews.filter(r => r.score === 3).length,
    negative: recentReviews.filter(r => r.score <= 2).length,
    averageScore: recentReviews.reduce((sum, r) => sum + r.score, 0) / recentReviews.length
  };
  
  const overallTrend = 
    recentSentiment.averageScore > (totalScore / reviews.length) ? "Improving" :
    recentSentiment.averageScore < (totalScore / reviews.length) ? "Declining" : "Stable";
  
  return {
    appId: appDetails.appId,
    title: appDetails.title,
    platform: "android",
    totalReviews: appDetails.reviews || 0,
    averageScore: appDetails.score,
    reviewCount: reviews.length,
    sampleAverageScore: totalScore / reviews.length,
    overallSentiment: sentiment.positive > sentiment.negative ? "Positive" : "Negative",
    ratingsDistribution: ratingCount,
    sentimentAnalysis: sentiment,
    recentSentiment: recentSentiment,
    trend: overallTrend,
    commonKeywords: keywords,
    versionFeedback: versionFeedback,
    engagement: engagement,
    topPositiveReview: reviews.filter(r => r.score >= 4).sort((a, b) => (b.thumbsUp || 0) - (a.thumbsUp || 0))[0] || null,
    topNegativeReview: reviews.filter(r => r.score <= 2).sort((a, b) => (b.thumbsUp || 0) - (a.thumbsUp || 0))[0] || null
  };
}

// Helper function to analyze iOS reviews
function analyzeIOSReviews(reviews, appDetails) {
  // Count reviews by rating
  const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalScore = 0;
  
  reviews.forEach(review => {
    ratingCount[review.score] = (ratingCount[review.score] || 0) + 1;
    totalScore += review.score;
  });
  
  // Extract common themes/keywords from review texts
  const keywords = extractReviewKeywords(reviews.map(r => r.text).filter(Boolean));
  
  // Get version-specific feedback
  const versionFeedback = {};
  reviews.forEach(review => {
    if (review.version) {
      if (!versionFeedback[review.version]) {
        versionFeedback[review.version] = {
          count: 0,
          averageScore: 0,
          totalScore: 0,
          keywords: {}
        };
      }
      
      versionFeedback[review.version].count++;
      versionFeedback[review.version].totalScore += review.score;
      
      // Extract keywords for this version
      if (review.text) {
        const versionKeywords = extractReviewKeywords([review.text]);
        Object.keys(versionKeywords).forEach(keyword => {
          versionFeedback[review.version].keywords[keyword] = 
            (versionFeedback[review.version].keywords[keyword] || 0) + versionKeywords[keyword];
        });
      }
    }
  });
  
  // Calculate average scores for each version
  Object.keys(versionFeedback).forEach(version => {
    versionFeedback[version].averageScore = 
      versionFeedback[version].totalScore / versionFeedback[version].count;
    
    // Sort the keywords
    versionFeedback[version].keywords = Object.entries(versionFeedback[version].keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  });
  
  // Positive vs negative reviews
  const sentiment = {
    positive: reviews.filter(r => r.score >= 4).length,
    neutral: reviews.filter(r => r.score === 3).length,
    negative: reviews.filter(r => r.score <= 2).length
  };
  
  // Check for recent trend in sentiment
  const recentReviews = reviews.slice(0, Math.min(20, reviews.length));
  const recentSentiment = {
    positive: recentReviews.filter(r => r.score >= 4).length,
    neutral: recentReviews.filter(r => r.score === 3).length,
    negative: recentReviews.filter(r => r.score <= 2).length,
    averageScore: recentReviews.reduce((sum, r) => sum + r.score, 0) / recentReviews.length
  };
  
  const overallTrend = 
    recentSentiment.averageScore > (totalScore / reviews.length) ? "Improving" :
    recentSentiment.averageScore < (totalScore / reviews.length) ? "Declining" : "Stable";
  
  return {
    appId: appDetails.appId,
    id: appDetails.id,
    title: appDetails.title,
    platform: "ios",
    totalReviews: appDetails.reviews || 0,
    averageScore: appDetails.score,
    reviewCount: reviews.length,
    sampleAverageScore: totalScore / reviews.length,
    overallSentiment: sentiment.positive > sentiment.negative ? "Positive" : "Negative",
    ratingsDistribution: ratingCount,
    ratingsHistogram: appDetails.histogram || {},
    sentimentAnalysis: sentiment,
    recentSentiment: recentSentiment,
    trend: overallTrend,
    commonKeywords: keywords,
    versionFeedback: versionFeedback,
    topPositiveReview: reviews.filter(r => r.score >= 4)[0] || null,
    topNegativeReview: reviews.filter(r => r.score <= 2)[0] || null
  };
}

// Helper function to extract keywords from review texts
function extractReviewKeywords(reviewTexts) {
  // Combine all reviews into a single string
  const text = reviewTexts.join(' ').toLowerCase();
  
  // List of common stop words to filter out
  const stopWords = [
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
    'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 'he', 'him', 'his', 'she',
    'her', 'hers', 'it', 'its', 'we', 'us', 'our', 'ours', 'they', 'them', 'their',
    'theirs', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'of', 'in', 'out',
    'about', 'up', 'down', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don',
    'now', 'app', 'get', 'use', 'make', 'with', 'from', 'really', 'good', 'bad',
    'great', 'awesome', 'terrible', 'like', 'love', 'hate', 'best', 'worst',
    'nice', 'amazing'
  ];
  
  // Find all words and count their frequency
  const words = text.match(/\b(\w+)\b/g) || [];
  const wordCounts = {};
  
  words.forEach(word => {
    if (word.length > 2 && !stopWords.includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Find common word pairs (bigrams)
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 2 && words[i+1].length > 2 && 
        !stopWords.includes(words[i]) && !stopWords.includes(words[i+1])) {
      const bigram = words[i] + ' ' + words[i+1];
      bigrams.push(bigram);
    }
  }
  
  const bigramCounts = {};
  bigrams.forEach(bigram => {
    bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
  });
  
  // Combine single words and bigrams, sort by frequency
  const combinedCounts = { ...wordCounts, ...bigramCounts };
  
  return Object.entries(combinedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
}

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    console.error("Starting App Store Scraper MCP server...");
    await server.connect(transport);
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

main(); 