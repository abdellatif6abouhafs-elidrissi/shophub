const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://abouhafs05:Rajalove2001@cluster0.vhmlghp.mongodb.net/shophub?appName=Cluster0';

// Schemas
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

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
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  addresses: [],
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronic devices',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Everything for your home',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop',
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports equipment and activewear',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create products
    console.log('Creating products...');
    const products = [
      // Electronics
      {
        name: 'Wireless Bluetooth Headphones',
        slug: 'wireless-bluetooth-headphones',
        description: 'Premium noise-canceling wireless headphones with 30-hour battery life.',
        price: 199.99,
        comparePrice: 249.99,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'],
        category: createdCategories[0]._id,
        brand: 'AudioTech',
        stock: 50,
        sku: 'ELEC-001',
        tags: ['wireless', 'bluetooth', 'noise-canceling'],
        ratings: { average: 4.5, count: 128 },
        isFeatured: true,
      },
      {
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.',
        price: 299.99,
        comparePrice: 349.99,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
        category: createdCategories[0]._id,
        brand: 'TechWear',
        stock: 35,
        sku: 'ELEC-002',
        tags: ['smartwatch', 'fitness', 'gps'],
        ratings: { average: 4.8, count: 256 },
        isFeatured: true,
      },
      {
        name: 'Portable Bluetooth Speaker',
        slug: 'portable-bluetooth-speaker',
        description: 'Waterproof portable speaker with 360-degree sound and 20-hour battery.',
        price: 79.99,
        comparePrice: 99.99,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'],
        category: createdCategories[0]._id,
        brand: 'SoundBlast',
        stock: 75,
        sku: 'ELEC-003',
        tags: ['bluetooth', 'speaker', 'waterproof'],
        ratings: { average: 4.6, count: 203 },
        isFeatured: true,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        slug: 'mechanical-gaming-keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX switches.',
        price: 149.99,
        comparePrice: 179.99,
        images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=600&fit=crop'],
        category: createdCategories[0]._id,
        brand: 'GameGear',
        stock: 40,
        sku: 'ELEC-004',
        tags: ['keyboard', 'gaming', 'mechanical'],
        ratings: { average: 4.7, count: 167 },
        isFeatured: true,
      },
      // Fashion
      {
        name: 'Classic Leather Jacket',
        slug: 'classic-leather-jacket',
        description: 'Timeless leather jacket crafted from premium genuine leather.',
        price: 249.99,
        comparePrice: 299.99,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop'],
        category: createdCategories[1]._id,
        brand: 'UrbanStyle',
        stock: 25,
        sku: 'FASH-001',
        tags: ['leather', 'jacket', 'classic'],
        ratings: { average: 4.7, count: 156 },
        isFeatured: true,
      },
      {
        name: 'Designer Sunglasses',
        slug: 'designer-sunglasses',
        description: 'UV400 protection sunglasses with polarized lenses.',
        price: 149.99,
        comparePrice: 189.99,
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'],
        category: createdCategories[1]._id,
        brand: 'VisionStyle',
        stock: 60,
        sku: 'FASH-002',
        tags: ['sunglasses', 'uv-protection', 'polarized'],
        ratings: { average: 4.5, count: 98 },
        isFeatured: true,
      },
      {
        name: 'Casual Sneakers',
        slug: 'casual-sneakers',
        description: 'Comfortable everyday sneakers with memory foam insole.',
        price: 89.99,
        comparePrice: 119.99,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'],
        category: createdCategories[1]._id,
        brand: 'StepStyle',
        stock: 80,
        sku: 'FASH-003',
        tags: ['sneakers', 'casual', 'comfortable'],
        ratings: { average: 4.6, count: 245 },
        isFeatured: true,
      },
      // Home & Living
      {
        name: 'Ergonomic Office Chair',
        slug: 'ergonomic-office-chair',
        description: 'Premium ergonomic chair with lumbar support.',
        price: 399.99,
        comparePrice: 499.99,
        images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop'],
        category: createdCategories[2]._id,
        brand: 'ComfortDesk',
        stock: 20,
        sku: 'HOME-001',
        tags: ['office', 'chair', 'ergonomic'],
        ratings: { average: 4.8, count: 187 },
        isFeatured: true,
      },
      {
        name: 'Smart LED Desk Lamp',
        slug: 'smart-led-desk-lamp',
        description: 'Adjustable LED lamp with touch control and wireless charging.',
        price: 59.99,
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop'],
        category: createdCategories[2]._id,
        brand: 'BrightHome',
        stock: 80,
        sku: 'HOME-002',
        tags: ['lamp', 'led', 'smart'],
        ratings: { average: 4.3, count: 145 },
        isFeatured: false,
      },
      {
        name: 'Ceramic Plant Pot Set',
        slug: 'ceramic-plant-pot-set',
        description: 'Set of 3 modern ceramic plant pots with drainage holes.',
        price: 34.99,
        images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop'],
        category: createdCategories[2]._id,
        brand: 'GreenHome',
        stock: 90,
        sku: 'HOME-003',
        tags: ['plants', 'ceramic', 'decor'],
        ratings: { average: 4.6, count: 134 },
        isFeatured: true,
      },
      // Sports
      {
        name: 'Running Shoes Elite',
        slug: 'running-shoes-elite',
        description: 'Lightweight running shoes with responsive cushioning.',
        price: 129.99,
        comparePrice: 159.99,
        images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop'],
        category: createdCategories[3]._id,
        brand: 'SpeedRunner',
        stock: 45,
        sku: 'SPRT-001',
        tags: ['running', 'shoes', 'athletic'],
        ratings: { average: 4.7, count: 289 },
        isFeatured: true,
      },
      {
        name: 'Adjustable Dumbbell Set',
        slug: 'adjustable-dumbbell-set',
        description: 'Space-saving adjustable dumbbells from 5 to 52.5 lbs.',
        price: 299.99,
        comparePrice: 399.99,
        images: ['https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&h=600&fit=crop'],
        category: createdCategories[3]._id,
        brand: 'IronPump',
        stock: 30,
        sku: 'SPRT-002',
        tags: ['dumbbells', 'weights', 'home-gym'],
        ratings: { average: 4.8, count: 156 },
        isFeatured: true,
      },
      {
        name: 'Professional Yoga Mat',
        slug: 'professional-yoga-mat',
        description: 'Extra thick, non-slip yoga mat with carrying strap.',
        price: 49.99,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop'],
        category: createdCategories[3]._id,
        brand: 'ZenFit',
        stock: 120,
        sku: 'SPRT-003',
        tags: ['yoga', 'mat', 'fitness'],
        ratings: { average: 4.6, count: 234 },
        isFeatured: false,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Create admin user with properly hashed password
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('test123', salt);

    await User.create({
      name: 'Admin',
      email: 'admin@shophub.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
    });

    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: userPassword,
      role: 'user',
      isVerified: true,
    });

    console.log('\n========================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\nCredentials:');
    console.log('Admin: admin@shophub.com / admin123');
    console.log('User: test@example.com / test123');
    console.log('\nProducts:', createdProducts.length);
    console.log('Categories:', createdCategories.length);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
