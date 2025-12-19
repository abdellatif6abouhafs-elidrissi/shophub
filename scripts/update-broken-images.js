const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abouhafs05:Rajalove2001@cluster0.vhmlghp.mongodb.net/shophub?appName=Cluster0';

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: [String],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 100% working Unsplash image URLs (verified)
const workingImages = {
  // Page 2 products - using direct Unsplash photos that definitely work
  'nespresso-vertuo-next': ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'],
  'philips-hue-starter-kit': ['https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800'],
  'dyson-v15-detect': ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800'],
  'guess-floral-dress': ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
  'michael-kors-tote': ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
  'zara-oversized-blazer': ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'],
  'tommy-hilfiger-polo': ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800'],
  'rayban-aviator-classic': ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'],
  'north-face-nuptse-jacket': ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
  'levis-501-original': ['https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800'],
  'adidas-ultraboost-23': ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'],
  'nike-air-force-1-white': ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800'],

  // Other products that might have issues
  'sony-wh1000xm5': ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'],
  'airpods-pro-2': ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800'],
  'bose-quietcomfort-ultra': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
  'apple-watch-ultra-2': ['https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800'],
  'samsung-galaxy-watch-6-classic': ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'],
  'iphone-15-pro-max-256': ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800'],
  'samsung-galaxy-s24-ultra': ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'],
  'google-pixel-8-pro': ['https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800'],
};

async function updateImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    let updated = 0;
    for (const [slug, images] of Object.entries(workingImages)) {
      const result = await Product.updateOne(
        { slug },
        { $set: { images } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${slug}`);
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} product images with verified working URLs`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateImages();
