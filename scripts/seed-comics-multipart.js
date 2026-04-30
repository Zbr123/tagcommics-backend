/**
 * Comic Seed Script - Multipart Mode
 *
 * This script seeds comics using FormData (multipart/form-data).
 * It uploads actual image files to:
 *   src/uploads/comics/images/
 *
 * Backend serves from same directory.
 *
 * Run: node scripts/seed-comics-multipart.js
 *
 * NOTE: Requires image files to exist in src/uploads/comics/images/
 *       Also installs form-data package if not present.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with your actual token

// Image storage directory (where backend serves from)
const IMAGE_DIR = path.join(process.cwd(), 'src', 'uploads', 'comics', 'images');

// Explicit filename mapping: coverKey -> filename
const coverImages = {
  spiderman: 'spiderman.jpg',
  batman: 'batman.jpg',
  xmen: 'xmen.jpg',
  walkingdead: 'walkingdead.jpg',
  invincible: 'invincible.jpg',
  saga: 'saga.jpg',
  watchmen: 'watchmen.jpg',
  maus: 'maus.jpg',
  vendetta: 'vendetta.jpg',
  sandman: 'sandman.jpg',
  ylastman: 'ylastman.jpg',
  fables: 'fables.jpg',
  hellboy: 'hellboy.jpg',
  scottpilgrim: 'scottpilgrim.jpg',
  daredevil: 'daredevil.jpg',
  planetary: 'planetary.jpg',
  criminal: 'criminal.jpg',
  akira: 'akira.jpg',
  onepiece: 'onepiece.jpg',
  naruto: 'naruto.jpg'
};

const comics = [
  { title: "Spider-Man: Amazing Fantasy #15", cover: 'spiderman', price: 9.99, author: "Stan Lee", rating: 4.8, sold_count: 500, is_featured: true, published_date: "1962-08-10" },
  { title: "Batman: The Dark Knight Returns", cover: 'batman', price: 14.99, author: "Frank Miller", rating: 4.9, sold_count: 1200, is_featured: true, published_date: "1986-03-01" },
  { title: "X-Men: Days of Future Past", cover: 'xmen', price: 12.99, author: "Chris Claremont", rating: 4.7, sold_count: 800, is_featured: false, published_date: "1981-11-01" },
  { title: "The Walking Dead Deluxe Vol 1", cover: 'walkingdead', price: 9.99, author: "Robert Kirkman", rating: 4.6, sold_count: 600, is_featured: true, published_date: "2003-10-01" },
  { title: "Invincible: Ultimate Collection Vol 1", cover: 'invincible', price: 19.99, author: "Robert Kirkman", rating: 4.8, sold_count: 450, is_featured: true, published_date: "2002-01-22" },
  { title: "Saga Volume 1", cover: 'saga', price: 11.99, author: "Brian K. Vaughan", rating: 4.9, sold_count: 950, is_featured: true, published_date: "2012-03-14" },
  { title: "Watchmen", cover: 'watchmen', price: 15.99, author: "Alan Moore", rating: 4.9, sold_count: 1500, is_featured: true, published_date: "1986-09-01" },
  { title: "Maus", cover: 'maus', price: 13.99, author: "Art Spiegelman", rating: 4.7, sold_count: 700, is_featured: false, published_date: "1980-10-01" },
  { title: "V for Vendetta", cover: 'vendetta', price: 12.99, author: "Alan Moore", rating: 4.6, sold_count: 550, is_featured: false, published_date: "1982-09-01" },
  { title: "The Sandman Vol 1: Preludes and Nocturnes", cover: 'sandman', price: 14.99, author: "Neil Gaiman", rating: 4.9, sold_count: 1100, is_featured: true, published_date: "1989-01-01" },
  { title: "Y: The Last Man Vol 1", cover: 'ylastman', price: 11.99, author: "Brian K. Vaughan", rating: 4.7, sold_count: 480, is_featured: false, published_date: "2002-09-01" },
  { title: "Fables Vol 1: Legends in Exile", cover: 'fables', price: 10.99, author: "Bill Willingham", rating: 4.5, sold_count: 380, is_featured: false, published_date: "2002-10-01" },
  { title: "Hellboy Vol 1: Seed of Destruction", cover: 'hellboy', price: 11.99, author: "Mike Mignola", rating: 4.7, sold_count: 520, is_featured: true, published_date: "1993-01-01" },
  { title: "Scott Pilgrim Volume 1", cover: 'scottpilgrim', price: 9.99, author: "Bryan Lee O'Malley", rating: 4.6, sold_count: 750, is_featured: true, published_date: "2004-07-01" },
  { title: "Daredevil: Guardian Devil", cover: 'daredevil', price: 12.99, author: "Frank Miller", rating: 4.8, sold_count: 420, is_featured: false, published_date: "1979-10-01" },
  { title: "Planetary Vol 1", cover: 'planetary', price: 10.99, author: "Warren Ellis", rating: 4.6, sold_count: 340, is_featured: false, published_date: "2000-01-01" },
  { title: "Criminal Vol 1: Coward", cover: 'criminal', price: 11.99, author: "Ed Brubaker", rating: 4.5, sold_count: 280, is_featured: false, published_date: "2006-01-01" },
  { title: "Akira Vol 1", cover: 'akira', price: 13.99, author: "Katsuhiro Otomo", rating: 4.9, sold_count: 680, is_featured: true, published_date: "1988-10-01" },
  { title: "One Piece Vol 1", cover: 'onepiece', price: 7.99, author: "Eiichiro Oda", rating: 4.9, sold_count: 2000, is_featured: true, published_date: "1997-07-22" },
  { title: "Naruto Vol 1", cover: 'naruto', price: 7.99, author: "Masashi Kishimoto", rating: 4.7, sold_count: 1800, is_featured: true, published_date: "1999-09-04" }
];

// Check if image file exists
function imageExists(filename) {
  return fs.existsSync(path.join(IMAGE_DIR, filename));
}

// Get cover filename
function getCoverFilename(coverKey) {
  return coverImages[coverKey] || null;
}

async function seedWithMultipart(comic, index) {
  const formData = new FormData();

  // Add all text fields
  formData.append('title', comic.title);
  formData.append('author', comic.author || '');
  formData.append('price', comic.price?.toString() || '0');
  formData.append('rating', comic.rating?.toString() || '0');
  formData.append('sold_count', comic.sold_count?.toString() || '0');
  formData.append('is_featured', comic.is_featured ? 'true' : 'false');
  formData.append('published_date', comic.published_date || '');
  formData.append('currency', 'USD');

  // Attach cover image if exists
  const coverFilename = getCoverFilename(comic.cover);
  if (coverFilename && imageExists(coverFilename)) {
    const filePath = path.join(IMAGE_DIR, coverFilename);
    formData.append('cover_image', fs.createReadStream(filePath), coverFilename);
  } else {
    console.log(`   ⚠️  No cover image found for: ${comic.cover} (${coverFilename || 'unknown'})`);
  }

  const response = await fetch(`${BASE_URL}/comics`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    },
    body: formData
  });

  return await response.json();
}

async function seedComics() {
  console.log('🚀 Starting comic seed (Multipart Mode)...\n');
  console.log(`📁 Image source: ${IMAGE_DIR}`);
  console.log(`📋 Backend field name: cover_image`);
  console.log(`🔗 Stored URL: /api/v1/uploads/images/{filename}\n`);

  if (!ADMIN_TOKEN || ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
    console.log('❌ ERROR: Please set your ADMIN_TOKEN in the script');
    console.log('   1. Login: POST /api/v1/auth/login');
    console.log('   2. Copy access_token from response');
    console.log('   3. Replace YOUR_ADMIN_TOKEN_HERE in this script\n');
    return;
  }

  // List missing images
  console.log('📋 Image availability check:');
  comics.forEach((comic, i) => {
    const filename = coverImages[comic.cover];
    const exists = imageExists(filename);
    console.log(`   ${exists ? '✅' : '⚠️ '} [${i + 1}] ${filename} - ${exists ? 'found' : 'MISSING'}`);
  });
  console.log('');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < comics.length; i++) {
    const comic = comics[i];
    console.log(`\n📦 [${i + 1}/${comics.length}] "${comic.title}"`);

    try {
      const data = await seedWithMultipart(comic, i);

      if (data.status === 201) {
        success++;
        console.log(`   ✅ Created (ID: ${data.data?.comic_id})`);
        if (data.data?.cover_image_url) {
          console.log(`   📷 URL: ${data.data.cover_image_url}`);
        }
      } else {
        failed++;
        console.log(`   ❌ Failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      failed++;
      console.log(`   ❌ Network error: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n========================================');
  console.log(`📊 Multipart Seed Complete!`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('========================================\n');
}

seedComics();