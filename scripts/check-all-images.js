const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abouhafs05:Rajalove2001@cluster0.vhmlghp.mongodb.net/shophub?appName=Cluster0';

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Reliable placeholder images by category
const categoryImages = {
  'electronics': [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  ],
  'fashion': [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800',
  ],
  'home-living': [
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
  ],
  'sports': [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
    'https://images.unsplash.com/photo-1461896836934- voices-of-silence?w=800',
  ],
};

async function checkAndFixImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.slug;
    });

    const products = await Product.find({}).populate('category');

    console.log('Checking all products for missing/broken images...\n');

    let needsFix = [];
    for (const product of products) {
      const hasImage = product.images && product.images.length > 0 && product.images[0];
      if (!hasImage) {
        needsFix.push(product);
        console.log(`❌ No image: ${product.name}`);
      }
    }

    if (needsFix.length === 0) {
      console.log('✅ All products have images!');
    } else {
      console.log(`\n Found ${needsFix.length} products without images. Fixing...\n`);

      for (const product of needsFix) {
        const catSlug = product.category?.slug || 'electronics';
        const images = categoryImages[catSlug] || categoryImages['electronics'];
        const randomImage = images[Math.floor(Math.random() * images.length)];

        await Product.updateOne(
          { _id: product._id },
          { $set: { images: [randomImage] } }
        );
        console.log(`Fixed: ${product.name} -> ${catSlug} image`);
      }
    }

    // List all products with page info
    console.log('\n--- All Products (12 per page) ---\n');
    const allProducts = await Product.find({}).sort({ createdAt: -1 });

    allProducts.forEach((p, i) => {
      const page = Math.floor(i / 12) + 1;
      const hasImg = p.images && p.images[0] ? '✅' : '❌';
      if (page === 2) {
        console.log(`Page ${page} | ${hasImg} ${p.name}`);
        console.log(`   Image: ${p.images?.[0] || 'NONE'}`);
      }
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndFixImages();
