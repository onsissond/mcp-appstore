/**
 * Test script to find working iOS app reviews
 */

import appStore from 'app-store-scraper';

const TEST_APPS = [
  { name: 'Facebook', id: '284882215' },
  { name: 'Instagram', id: '389801252' },
  { name: 'Twitter/X', id: '333903271' },
  { name: 'YouTube', id: '544007664' },
  { name: 'TikTok', id: '835599320' },
  { name: 'WhatsApp', id: '310633997' },
  { name: 'Gmail', id: '422689480' },
  { name: 'Spotify', id: '324684580' }
];

async function testReviews() {
  console.log('Testing iOS app reviews retrieval...');
  
  for (const app of TEST_APPS) {
    console.log(`\nTesting reviews for ${app.name} (ID: ${app.id})`);
    
    try {
      const reviews = await appStore.reviews({
        id: app.id,
        country: 'us',
        page: 1
      });
      
      if (reviews && reviews.length > 0) {
        console.log(`✅ SUCCESS: Found ${reviews.length} reviews`);
        console.log('First review:');
        console.log(`- Rating: ${reviews[0].score}`);
        console.log(`- Title: ${reviews[0].title}`);
        
        // Return instructions for updating the test script
        console.log('\n=== USE THIS APP IN YOUR TESTS ===');
        console.log(`App Name: ${app.name}`);
        console.log(`App ID: ${app.id}`);
        console.log(`Reviews Available: ${reviews.length}`);
        
        // Exit on first success
        process.exit(0);
      } else {
        console.log('❌ FAIL: No reviews found');
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}`);
    }
  }
  
  console.log('\nNone of the test apps have accessible reviews. Consider these options:');
  console.log('1. Try other popular apps');
  console.log('2. Check if the app-store-scraper package needs updating');
  console.log('3. Implement a fallback mechanism in your code');
}

testReviews(); 