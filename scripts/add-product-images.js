const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Product images by category
const categoryImages = {
  electronics: [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
  ],
  home: [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934- voices-of-athletes?w=800',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=800',
  ],
  default: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  ],
};

async function updateProductImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    const categoriesCollection = db.collection('categories');

    // Get all categories
    const categories = await categoriesCollection.find({}).toArray();
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name.toLowerCase();
    });

    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products`);

    let updated = 0;
    for (const product of products) {
      // Determine category
      let categoryName = 'default';
      if (product.category) {
        const catId = product.category.toString();
        if (categoryMap[catId]) {
          const name = categoryMap[catId];
          if (name.includes('electronic') || name.includes('tech')) categoryName = 'electronics';
          else if (name.includes('fashion') || name.includes('cloth')) categoryName = 'fashion';
          else if (name.includes('home') || name.includes('living')) categoryName = 'home';
          else if (name.includes('sport')) categoryName = 'sports';
        }
      }

      // Get random images from category
      const images = categoryImages[categoryName] || categoryImages.default;
      const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 images
      const selectedImages = [];
      for (let i = 0; i < numImages; i++) {
        selectedImages.push(images[i % images.length]);
      }

      // Update product with images
      await productsCollection.updateOne(
        { _id: product._id },
        { $set: { images: selectedImages } }
      );
      updated++;
      console.log(`Updated: ${product.name}`);
    }

    console.log(`\nUpdated ${updated} products with images`);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateProductImages();
