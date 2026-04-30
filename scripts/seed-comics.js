/**
 * Comic Seed Script - JSON Mode with Cover Images
 *
 * This script seeds 20 sample comics with cover image URLs.
 * Images are expected to already exist in:
 *   src/uploads/comics/images/
 *
 * Image URL format stored in DB:
 *   /api/v1/uploads/images/{filename}
 *
 * Backend serves from:
 *   src/uploads/comics/images/
 *
 * Run: node scripts/seed-comics.js
 *
 * NOTE: This script does NOT upload files. It only sets the cover_image_url.
 *       Image files must already exist in src/uploads/comics/images/
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGM5OGM5ZmQtZDAzYy00ZGVjLWEzMjgtMTZlYTYwMzgwOTE5IiwiZW1haWwiOiJhZG1pbjJAdGVzdC5jb20iLCJuYW1lIjoiQWRtaW4gVXNlciIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE3Nzc1MzYyMzAsImV4cCI6MTc3NzU3MjIzMH0.zYjxO7g768i5i1bkYMUx698ZSPynfVg7crrPlL0mEVQ'; // Replace with your actual token

// Image storage directory (where backend serves from)
const IMAGE_DIR = path.join(process.cwd(), 'src', 'uploads', 'comics', 'images');

// Explicit filename mapping: coverKey -> filename
const coverImages = {
  spiderman: 'red-roots.jpg',
  batman: 'titan-x.png',
  xmen: 'crimsin.png',
  walkingdead: 'fairlady.jpg',
  invincible: 'feral.jpg',
  saga: 'urban.png',
  watchmen: 'vanguard.png',
  };

// Fallback if cover file not found (no URL set)
const FALLBACK_COVER = 'default-cover.jpg';

// Check if image file exists
function imageExists(filename) {
  const filepath = path.join(IMAGE_DIR, filename);
  return fs.existsSync(filepath);
}

const comics = [
  {
    title: "Spider-Man: Amazing Fantasy #15",
    author: "Stan Lee",
    description: "The first appearance of Spider-Man! A must-read for any comic fan.",
    series_name: "Amazing Fantasy",
    issue_number: 15,
    price: 9.99,
    discounted_price: 7.99,
    currency: "USD",
    rating: 4.8,
    sold_count: 500,
    stock_quantity: 100,
    is_featured: true,
    is_digital: true,
    is_physical: true,
    published_date: "1962-08-10",
    cover: 'spiderman'
  },
  {
    title: "Batman: The Dark Knight Returns",
    author: "Frank Miller",
    description: "Batman returns in this legendary graphic novel that redefined the character.",
    series_name: "Batman",
    issue_number: 1,
    price: 14.99,
    discounted_price: 11.99,
    currency: "USD",
    rating: 4.9,
    sold_count: 1200,
    stock_quantity: 50,
    is_featured: true,
    is_digital: true,
    is_physical: true,
    published_date: "1986-03-01",
    cover: 'batman'
  },
  {
    title: "X-Men: Days of Future Past",
    author: "Chris Claremont",
    description: "Classic X-Men storyline that changed everything.",
    series_name: "X-Men",
    issue_number: 141,
    price: 12.99,
    discounted_price: 9.99,
    currency: "USD",
    rating: 4.7,
    sold_count: 800,
    stock_quantity: 30,
    is_featured: false,
    is_digital: true,
    is_physical: true,
    published_date: "1981-11-01",
    cover: 'xmen'
  },
  {
    title: "The Walking Dead Deluxe Vol 1",
    author: "Robert Kirkman",
    description: "Zombie apocalypse horror at its finest.",
    series_name: "The Walking Dead",
    issue_number: 1,
    price: 9.99,
    discounted_price: 7.99,
    currency: "USD",
    rating: 4.6,
    sold_count: 600,
    stock_quantity: 80,
    is_featured: true,
    is_digital: true,
    is_physical: true,
    published_date: "2003-10-01",
    cover: 'walkingdead'
  },
  {
    title: "Invincible: Ultimate Collection Vol 1",
    author: "Robert Kirkman",
    description: "The complete story of Mark Grayson, Earth's most powerful hero.",
    series_name: "Invincible",
    issue_number: 1,
    price: 19.99,
    discounted_price: 15.99,
    currency: "USD",
    rating: 4.8,
    sold_count: 450,
    stock_quantity: 40,
    is_featured: true,
    is_digital: true,
    is_physical: false,
    published_date: "2002-01-22",
    cover: 'invincible'
  },
  {
    title: "Saga Volume 1",
    author: "Brian K. Vaughan",
    description: "A epic space opera about family, love, and hope.",
    series_name: "Saga",
    issue_number: 1,
    price: 11.99,
    discounted_price: 8.99,
    currency: "USD",
    rating: 4.9,
    sold_count: 950,
    stock_quantity: 120,
    is_featured: true,
    is_digital: true,
    is_physical: true,
    published_date: "2012-03-14",
    cover: 'saga'
  },

];

// Get cover URL from cover key
function getCoverUrl(coverKey) {
  const filename = coverImages[coverKey] || FALLBACK_COVER;
  return `/api/v1/uploads/images/${filename}`;
}

// Prepare comic data for API
function prepareComicData(comic) {
  const { cover, ...rest } = comic;
  return {
    ...rest,
    cover_image_url: getCoverUrl(cover)
  };
}

async function seedComics() {
  console.log('🚀 Starting comic seed (JSON Mode)...\n');
  console.log(`📁 Image source: src/uploads/comics/images/`);
  console.log(`🔗 DB URL format: /api/v1/uploads/images/{filename}`);
  console.log(`🌐 Backend serves at: http://localhost:5000/api/v1/uploads/images/\n`);

  // Validate token
  if (!ADMIN_TOKEN || ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
    console.log('❌ ERROR: Please set your ADMIN_TOKEN in the script');
    console.log('   1. Login to get token: POST /api/v1/auth/login');
    console.log('   2. Copy access_token from response');
    console.log('   3. Replace YOUR_ADMIN_TOKEN_HERE in this script\n');
    return;
  }

  let success = 0;
  let failed = 0;
  let missingImages = 0;

  for (let i = 0; i < comics.length; i++) {
    const comic = comics[i];
    const apiData = prepareComicData(comic);
    const filename = coverImages[comic.cover] || FALLBACK_COVER;

    // Check if image file exists
    if (!imageExists(filename)) {
      console.log(`⚠️  [${i + 1}/20] "${comic.title}"`);
      console.log(`   ⚠️  Image not found: ${IMAGE_DIR}/${filename}`);
      missingImages++;
    }

    try {
      const response = await fetch(`${BASE_URL}/comics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (response.status === 201) {
        success++;
        console.log(`✅ [${i + 1}/20] "${comic.title}"`);
        console.log(`   📷 File: ${filename}`);
        console.log(`   🔗 URL: ${apiData.cover_image_url}`);
      } else {
        failed++;
        console.log(`❌ [${i + 1}/20] "${comic.title}" - ${data.message || response.status}`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ [${i + 1}/20] "${comic.title}" - Network error: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n========================================');
  console.log(`📊 Seed Complete!`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Missing images: ${missingImages}`);
  console.log('========================================\n');

  if (missingImages > 0) {
    console.log('📋 Missing images summary:');
    console.log(`   Place these files in: ${IMAGE_DIR}/`);
    comics.forEach((comic, i) => {
      const filename = coverImages[comic.cover] || FALLBACK_COVER;
      if (!imageExists(filename)) {
        console.log(`   - ${filename} (for "${comic.title}")`);
      }
    });
    console.log('');
  }

  if (success > 0) {
    console.log('🧪 Test image URLs:');
    console.log(`   curl http://localhost:5000/api/v1/uploads/images/spiderman.jpg`);
    console.log('');
    console.log('🧪 Test API:');
    console.log(`   curl ${BASE_URL}/comics?limit=3`);
    console.log(`   curl ${BASE_URL}/comics/featured\n`);
  }
}

seedComics();