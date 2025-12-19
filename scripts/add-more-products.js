const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abouhafs05:Rajalove2001@cluster0.vhmlghp.mongodb.net/shophub?appName=Cluster0';

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  price: Number,
  comparePrice: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: String,
  stock: Number,
  sku: String,
  tags: [String],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  isFeatured: Boolean,
  isActive: Boolean,
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const newProducts = [
  // Electronics - Laptops & Computers
  {
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'The most powerful MacBook Pro ever with M3 Max chip, 36GB unified memory, and stunning Liquid Retina XDR display.',
    price: 3499.00,
    comparePrice: 3699.00,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    brand: 'Apple',
    stock: 15,
    sku: 'MBP16-M3MAX',
    tags: ['laptop', 'apple', 'pro', 'creative'],
    ratings: { average: 4.9, count: 234 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Dell XPS 15 OLED',
    slug: 'dell-xps-15-oled',
    description: 'Premium ultrabook with 15.6" 3.5K OLED display, Intel Core i9, 32GB RAM, and 1TB SSD.',
    price: 1899.00,
    comparePrice: 2199.00,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'],
    brand: 'Dell',
    stock: 22,
    sku: 'DXPS15-OLED',
    tags: ['laptop', 'ultrabook', 'oled', 'windows'],
    ratings: { average: 4.7, count: 189 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    slug: 'asus-rog-strix-g16',
    description: 'Ultimate gaming laptop with RTX 4070, Intel i9-13980HX, 16" 240Hz display, and RGB keyboard.',
    price: 1799.00,
    comparePrice: 1999.00,
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800'],
    brand: 'ASUS',
    stock: 18,
    sku: 'ROG-G16-4070',
    tags: ['gaming', 'laptop', 'rtx', 'rgb'],
    ratings: { average: 4.8, count: 156 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  // Electronics - Phones
  {
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256',
    description: 'Titanium design, A17 Pro chip, 48MP camera system, and Action button. The ultimate iPhone.',
    price: 1199.00,
    comparePrice: 1299.00,
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'],
    brand: 'Apple',
    stock: 50,
    sku: 'IP15PM-256',
    tags: ['iphone', 'smartphone', 'apple', '5g'],
    ratings: { average: 4.9, count: 1250 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'AI-powered smartphone with S Pen, 200MP camera, titanium frame, and 5000mAh battery.',
    price: 1299.00,
    comparePrice: 1399.00,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
    brand: 'Samsung',
    stock: 45,
    sku: 'SGS24U-256',
    tags: ['samsung', 'android', 'galaxy', 'ai'],
    ratings: { average: 4.8, count: 890 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    description: 'The best of Google AI in a phone. Tensor G3, Magic Eraser, 50MP camera, and 7 years of updates.',
    price: 999.00,
    comparePrice: 1099.00,
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'],
    brand: 'Google',
    stock: 35,
    sku: 'PX8PRO-256',
    tags: ['pixel', 'google', 'android', 'ai'],
    ratings: { average: 4.7, count: 567 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'electronics'
  },
  // Electronics - Audio
  {
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh1000xm5',
    description: 'Industry-leading noise cancellation, 30-hour battery, and exceptional sound quality.',
    price: 349.00,
    comparePrice: 399.00,
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
    brand: 'Sony',
    stock: 60,
    sku: 'SONY-XM5',
    tags: ['headphones', 'wireless', 'noise-cancelling', 'premium'],
    ratings: { average: 4.8, count: 2340 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'AirPods Pro 2nd Gen',
    slug: 'airpods-pro-2',
    description: 'Active Noise Cancellation, Adaptive Audio, USB-C charging case, and personalized Spatial Audio.',
    price: 249.00,
    comparePrice: 279.00,
    images: ['https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=800'],
    brand: 'Apple',
    stock: 100,
    sku: 'APP2-USBC',
    tags: ['airpods', 'wireless', 'earbuds', 'apple'],
    ratings: { average: 4.7, count: 4560 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Bose QuietComfort Ultra',
    slug: 'bose-quietcomfort-ultra',
    description: 'Immersive Audio with world-class noise cancellation. 24-hour battery life.',
    price: 429.00,
    comparePrice: 479.00,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'],
    brand: 'Bose',
    stock: 40,
    sku: 'BOSE-QCU',
    tags: ['headphones', 'bose', 'premium', 'wireless'],
    ratings: { average: 4.6, count: 890 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'JBL Charge 5 Bluetooth Speaker',
    slug: 'jbl-charge-5',
    description: 'Powerful portable speaker with 20 hours playtime, IP67 waterproof, and built-in powerbank.',
    price: 149.00,
    comparePrice: 179.00,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
    brand: 'JBL',
    stock: 75,
    sku: 'JBL-CHG5',
    tags: ['speaker', 'bluetooth', 'portable', 'waterproof'],
    ratings: { average: 4.7, count: 3450 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'electronics'
  },
  // Electronics - Wearables
  {
    name: 'Apple Watch Ultra 2',
    slug: 'apple-watch-ultra-2',
    description: 'The most rugged Apple Watch with 36-hour battery, precision GPS, and Action button.',
    price: 799.00,
    comparePrice: 849.00,
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800'],
    brand: 'Apple',
    stock: 30,
    sku: 'AWU2-49MM',
    tags: ['smartwatch', 'apple', 'fitness', 'gps'],
    ratings: { average: 4.8, count: 678 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic',
    slug: 'samsung-galaxy-watch-6-classic',
    description: 'Premium smartwatch with rotating bezel, advanced health monitoring, and Wear OS.',
    price: 399.00,
    comparePrice: 449.00,
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800'],
    brand: 'Samsung',
    stock: 45,
    sku: 'SGW6C-47MM',
    tags: ['smartwatch', 'samsung', 'android', 'health'],
    ratings: { average: 4.5, count: 456 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'electronics'
  },
  // Electronics - Gaming
  {
    name: 'PlayStation 5 Console',
    slug: 'playstation-5-console',
    description: 'Next-gen gaming with ultra-high speed SSD, ray tracing, 4K gaming, and haptic feedback.',
    price: 499.00,
    comparePrice: 549.00,
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'],
    brand: 'Sony',
    stock: 25,
    sku: 'PS5-DISC',
    tags: ['gaming', 'console', 'playstation', '4k'],
    ratings: { average: 4.9, count: 5670 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Xbox Series X',
    slug: 'xbox-series-x',
    description: 'Most powerful Xbox ever with 12 teraflops, 4K gaming at 120fps, and Quick Resume.',
    price: 499.00,
    comparePrice: 549.00,
    images: ['https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800'],
    brand: 'Microsoft',
    stock: 20,
    sku: 'XBOX-SX',
    tags: ['gaming', 'console', 'xbox', '4k'],
    ratings: { average: 4.8, count: 3450 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics'
  },
  {
    name: 'Nintendo Switch OLED',
    slug: 'nintendo-switch-oled',
    description: '7-inch OLED screen, enhanced audio, 64GB storage, and wide adjustable stand.',
    price: 349.00,
    comparePrice: 379.00,
    images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800'],
    brand: 'Nintendo',
    stock: 40,
    sku: 'NSW-OLED',
    tags: ['gaming', 'console', 'nintendo', 'portable'],
    ratings: { average: 4.8, count: 2890 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'electronics'
  },
  // Fashion - Men
  {
    name: 'Nike Air Force 1 Low White',
    slug: 'nike-air-force-1-white',
    description: 'The iconic sneaker with premium leather, Air-Sole cushioning, and timeless style.',
    price: 110.00,
    comparePrice: 130.00,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'],
    brand: 'Nike',
    stock: 120,
    sku: 'NAF1-WHT',
    tags: ['sneakers', 'nike', 'classic', 'white'],
    ratings: { average: 4.8, count: 8900 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'Adidas Ultraboost 23',
    slug: 'adidas-ultraboost-23',
    description: 'Responsive Boost midsole, Primeknit upper, and Continental rubber outsole.',
    price: 190.00,
    comparePrice: 220.00,
    images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800'],
    brand: 'Adidas',
    stock: 85,
    sku: 'ADI-UB23',
    tags: ['running', 'sneakers', 'boost', 'comfort'],
    ratings: { average: 4.7, count: 3450 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    slug: 'levis-501-original',
    description: 'The original blue jean since 1873. Straight fit, button fly, and iconic style.',
    price: 79.00,
    comparePrice: 98.00,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    brand: 'Levi\'s',
    stock: 150,
    sku: 'LEV-501-BLU',
    tags: ['jeans', 'denim', 'classic', 'menswear'],
    ratings: { average: 4.6, count: 5670 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'The North Face Nuptse Jacket',
    slug: 'north-face-nuptse-jacket',
    description: '700-fill goose down, water-resistant fabric, and iconic boxy silhouette.',
    price: 320.00,
    comparePrice: 380.00,
    images: ['https://images.unsplash.com/photo-1544923246-77307dd628b5?w=800'],
    brand: 'The North Face',
    stock: 45,
    sku: 'TNF-NUP-BLK',
    tags: ['jacket', 'winter', 'puffer', 'outdoor'],
    ratings: { average: 4.8, count: 2340 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'Ray-Ban Aviator Classic',
    slug: 'rayban-aviator-classic',
    description: 'Iconic pilot sunglasses with gold frame, green G-15 lenses, and 100% UV protection.',
    price: 161.00,
    comparePrice: 189.00,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
    brand: 'Ray-Ban',
    stock: 80,
    sku: 'RB-AVI-GLD',
    tags: ['sunglasses', 'aviator', 'classic', 'uv'],
    ratings: { average: 4.7, count: 4560 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'Tommy Hilfiger Polo Shirt',
    slug: 'tommy-hilfiger-polo',
    description: 'Classic fit polo in premium cotton piqué with signature flag embroidery.',
    price: 69.00,
    comparePrice: 85.00,
    images: ['https://images.unsplash.com/photo-1625910513413-5fc7c83a2a73?w=800'],
    brand: 'Tommy Hilfiger',
    stock: 200,
    sku: 'TH-POLO-NVY',
    tags: ['polo', 'casual', 'cotton', 'preppy'],
    ratings: { average: 4.5, count: 1890 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'fashion'
  },
  // Fashion - Women
  {
    name: 'Zara Oversized Blazer',
    slug: 'zara-oversized-blazer',
    description: 'Relaxed fit blazer with padded shoulders, front flap pockets, and lined interior.',
    price: 119.00,
    comparePrice: 149.00,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    brand: 'Zara',
    stock: 65,
    sku: 'ZAR-BLZ-BLK',
    tags: ['blazer', 'women', 'formal', 'oversized'],
    ratings: { average: 4.4, count: 890 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'Michael Kors Leather Tote Bag',
    slug: 'michael-kors-tote',
    description: 'Saffiano leather tote with gold-tone hardware, interior pockets, and magnetic snap closure.',
    price: 298.00,
    comparePrice: 358.00,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
    brand: 'Michael Kors',
    stock: 35,
    sku: 'MK-TOTE-BLK',
    tags: ['bag', 'tote', 'leather', 'designer'],
    ratings: { average: 4.6, count: 1234 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'fashion'
  },
  {
    name: 'Guess Floral Summer Dress',
    slug: 'guess-floral-dress',
    description: 'Lightweight midi dress with floral print, V-neck, and flowy silhouette.',
    price: 89.00,
    comparePrice: 118.00,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
    brand: 'Guess',
    stock: 55,
    sku: 'GS-DRS-FLR',
    tags: ['dress', 'summer', 'floral', 'casual'],
    ratings: { average: 4.3, count: 567 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'fashion'
  },
  // Home & Living
  {
    name: 'Dyson V15 Detect Vacuum',
    slug: 'dyson-v15-detect',
    description: 'Laser reveals hidden dust, piezo sensor counts particles, and 60 min runtime.',
    price: 749.00,
    comparePrice: 849.00,
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'],
    brand: 'Dyson',
    stock: 25,
    sku: 'DYS-V15',
    tags: ['vacuum', 'cordless', 'cleaning', 'smart'],
    ratings: { average: 4.8, count: 2340 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'home-living'
  },
  {
    name: 'Philips Hue Starter Kit',
    slug: 'philips-hue-starter-kit',
    description: '4 smart bulbs and Bridge. 16 million colors, voice control, and app scheduling.',
    price: 199.00,
    comparePrice: 229.00,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    brand: 'Philips',
    stock: 60,
    sku: 'PHI-HUE-4PK',
    tags: ['smart-home', 'lighting', 'led', 'wifi'],
    ratings: { average: 4.7, count: 4560 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'home-living'
  },
  {
    name: 'Nespresso Vertuo Next',
    slug: 'nespresso-vertuo-next',
    description: 'Centrifusion technology, 5 cup sizes, and one-touch brewing with WiFi connectivity.',
    price: 179.00,
    comparePrice: 209.00,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800'],
    brand: 'Nespresso',
    stock: 40,
    sku: 'NES-VN-BLK',
    tags: ['coffee', 'espresso', 'kitchen', 'smart'],
    ratings: { average: 4.5, count: 3450 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'home-living'
  },
  {
    name: 'KitchenAid Stand Mixer',
    slug: 'kitchenaid-stand-mixer',
    description: '5-quart stainless steel bowl, 10 speeds, and tilt-head design. Empire Red.',
    price: 449.00,
    comparePrice: 499.00,
    images: ['https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800'],
    brand: 'KitchenAid',
    stock: 30,
    sku: 'KA-SM-RED',
    tags: ['mixer', 'baking', 'kitchen', 'appliance'],
    ratings: { average: 4.9, count: 6780 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'home-living'
  },
  {
    name: 'iRobot Roomba j7+',
    slug: 'irobot-roomba-j7-plus',
    description: 'Avoids obstacles, self-empties, and maps your home. Smart pet owner favorite.',
    price: 599.00,
    comparePrice: 699.00,
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
    brand: 'iRobot',
    stock: 20,
    sku: 'IRB-J7P',
    tags: ['robot', 'vacuum', 'smart-home', 'cleaning'],
    ratings: { average: 4.6, count: 2890 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'home-living'
  },
  {
    name: 'Casper Original Mattress Queen',
    slug: 'casper-original-mattress-queen',
    description: '3 layers of premium foam, zoned support, and breathable design. 100-night trial.',
    price: 1095.00,
    comparePrice: 1295.00,
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
    brand: 'Casper',
    stock: 15,
    sku: 'CSP-MTR-QN',
    tags: ['mattress', 'bedroom', 'sleep', 'foam'],
    ratings: { average: 4.5, count: 4560 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'home-living'
  },
  {
    name: 'Instant Pot Duo Plus 6Qt',
    slug: 'instant-pot-duo-plus-6qt',
    description: '9-in-1 pressure cooker: pressure cook, slow cook, rice, steam, sauté, and more.',
    price: 89.00,
    comparePrice: 119.00,
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=800'],
    brand: 'Instant Pot',
    stock: 80,
    sku: 'IP-DUO-6QT',
    tags: ['cooking', 'pressure-cooker', 'kitchen', 'smart'],
    ratings: { average: 4.7, count: 12340 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'home-living'
  },
  // Sports & Outdoors
  {
    name: 'Peloton Bike+',
    slug: 'peloton-bike-plus',
    description: '24" rotating HD touchscreen, Apple GymKit, and auto-follow resistance.',
    price: 2495.00,
    comparePrice: 2695.00,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
    brand: 'Peloton',
    stock: 10,
    sku: 'PEL-BIKEP',
    tags: ['fitness', 'cycling', 'cardio', 'smart'],
    ratings: { average: 4.8, count: 3450 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'Bowflex SelectTech 552 Dumbbells',
    slug: 'bowflex-selecttech-552',
    description: 'Adjustable from 5 to 52.5 lbs. Replace 15 sets of weights. Dial system.',
    price: 429.00,
    comparePrice: 549.00,
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
    brand: 'Bowflex',
    stock: 35,
    sku: 'BFX-ST552',
    tags: ['weights', 'dumbbells', 'strength', 'adjustable'],
    ratings: { average: 4.7, count: 5670 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'Lululemon Align Leggings',
    slug: 'lululemon-align-leggings',
    description: 'Buttery-soft Nulu fabric, high-rise, 25" length. Perfect for yoga and everyday.',
    price: 98.00,
    comparePrice: 118.00,
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
    brand: 'Lululemon',
    stock: 100,
    sku: 'LUL-ALN-BLK',
    tags: ['leggings', 'yoga', 'women', 'activewear'],
    ratings: { average: 4.9, count: 8900 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'Yeti Tundra 45 Cooler',
    slug: 'yeti-tundra-45-cooler',
    description: 'Rotomolded construction, 2" insulation, and bear-resistant. Holds 26 cans.',
    price: 325.00,
    comparePrice: 375.00,
    images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'],
    brand: 'Yeti',
    stock: 25,
    sku: 'YETI-T45-WHT',
    tags: ['cooler', 'outdoor', 'camping', 'ice'],
    ratings: { average: 4.8, count: 2340 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'Hydro Flask 32oz Wide Mouth',
    slug: 'hydro-flask-32oz',
    description: 'TempShield insulation keeps drinks cold 24hrs or hot 12hrs. BPA-free.',
    price: 44.95,
    comparePrice: 54.95,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'],
    brand: 'Hydro Flask',
    stock: 150,
    sku: 'HF-32OZ-BLU',
    tags: ['bottle', 'hydration', 'insulated', 'outdoor'],
    ratings: { average: 4.7, count: 6780 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'Garmin Forerunner 965',
    slug: 'garmin-forerunner-965',
    description: 'AMOLED display, multi-band GPS, training readiness, and 23-day battery life.',
    price: 599.00,
    comparePrice: 649.00,
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800'],
    brand: 'Garmin',
    stock: 30,
    sku: 'GAR-FR965',
    tags: ['running', 'gps', 'watch', 'fitness'],
    ratings: { average: 4.8, count: 1890 },
    isFeatured: true,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'Coleman 6-Person Instant Tent',
    slug: 'coleman-6-person-instant-tent',
    description: 'Sets up in 60 seconds. Weathertec system, room for 2 queen airbeds.',
    price: 169.00,
    comparePrice: 219.00,
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    brand: 'Coleman',
    stock: 40,
    sku: 'COL-6PT',
    tags: ['camping', 'tent', 'outdoor', 'family'],
    ratings: { average: 4.5, count: 3450 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'sports'
  },
  {
    name: 'TRX Pro4 Suspension Trainer',
    slug: 'trx-pro4-suspension-trainer',
    description: 'Commercial-grade straps, steel carabiners, and 300+ exercises.',
    price: 249.00,
    comparePrice: 299.00,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'],
    brand: 'TRX',
    stock: 50,
    sku: 'TRX-PRO4',
    tags: ['fitness', 'suspension', 'strength', 'home-gym'],
    ratings: { average: 4.8, count: 2890 },
    isFeatured: false,
    isActive: true,
    categorySlug: 'sports'
  }
];

async function addProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get categories
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('Categories found:', Object.keys(categoryMap));

    let added = 0;
    for (const product of newProducts) {
      // Check if product exists
      const exists = await Product.findOne({ slug: product.slug });
      if (exists) {
        console.log(`Skipping ${product.name} (already exists)`);
        continue;
      }

      const categoryId = categoryMap[product.categorySlug];
      if (!categoryId) {
        console.log(`Category not found for ${product.name}: ${product.categorySlug}`);
        continue;
      }

      const newProduct = new Product({
        ...product,
        category: categoryId,
      });
      delete newProduct.categorySlug;

      await newProduct.save();
      console.log(`Added: ${product.name}`);
      added++;
    }

    console.log(`\n✅ Added ${added} new products!`);

    // Count total
    const total = await Product.countDocuments();
    console.log(`📦 Total products in database: ${total}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addProducts();
