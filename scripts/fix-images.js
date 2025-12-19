const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abouhafs05:Rajalove2001@cluster0.vhmlghp.mongodb.net/shophub?appName=Cluster0';

const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  images: [String],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Better working image URLs
const imageReplacements = {
  // Phones
  'iphone-15-pro-max-256': ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'],
  'samsung-galaxy-s24-ultra': ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'],
  'google-pixel-8-pro': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],

  // Laptops
  'macbook-pro-16-m3-max': ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
  'dell-xps-15-oled': ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'],
  'asus-rog-strix-g16': ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800'],

  // Audio
  'sony-wh1000xm5': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
  'airpods-pro-2': ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800'],
  'bose-quietcomfort-ultra': ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
  'jbl-charge-5': ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],

  // Wearables
  'apple-watch-ultra-2': ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800'],
  'samsung-galaxy-watch-6-classic': ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],

  // Gaming
  'playstation-5-console': ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'],
  'xbox-series-x': ['https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800'],
  'nintendo-switch-oled': ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'],

  // Fashion
  'nike-air-force-1-white': ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
  'adidas-ultraboost-23': ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800'],
  'levis-501-original': ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
  'north-face-nuptse-jacket': ['https://images.unsplash.com/photo-1544923246-77307dd628b5?w=800'],
  'rayban-aviator-classic': ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
  'tommy-hilfiger-polo': ['https://images.unsplash.com/photo-1625910513413-5fc7c83a2a73?w=800'],
  'zara-oversized-blazer': ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
  'michael-kors-tote': ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
  'guess-floral-dress': ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],

  // Home
  'dyson-v15-detect': ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'],
  'philips-hue-starter-kit': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
  'nespresso-vertuo-next': ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800'],
  'kitchenaid-stand-mixer': ['https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800'],
  'irobot-roomba-j7-plus': ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
  'casper-original-mattress-queen': ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
  'instant-pot-duo-plus-6qt': ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=800'],

  // Sports
  'peloton-bike-plus': ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
  'bowflex-selecttech-552': ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
  'lululemon-align-leggings': ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
  'yeti-tundra-45-cooler': ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'],
  'hydro-flask-32oz': ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
  'garmin-forerunner-965': ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800'],
  'coleman-6-person-instant-tent': ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
  'trx-pro4-suspension-trainer': ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'],
};

async function fixImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);

    let fixed = 0;
    for (const product of products) {
      if (imageReplacements[product.slug]) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { images: imageReplacements[product.slug] } }
        );
        console.log(`Fixed: ${product.name}`);
        fixed++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} product images`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixImages();
