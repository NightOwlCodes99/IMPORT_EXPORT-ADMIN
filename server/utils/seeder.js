const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: '../.env' }); // Assuming seeder is run from /utils or /
// Let's fallback if run from server/ directory directly:
const envPath = process.cwd().endsWith('server') ? './.env' : '../.env';
dotenv.config({ path: envPath });

// Load Models
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const dummyCategories = [
  { name: 'Industrial Machinery', description: 'Heavy machinery and equipment for industrial applications', icon: 'fas fa-cogs', order: 1 },
  { name: 'Agriculture', description: 'Farming equipment, seeds, and agricultural supplies', icon: 'fas fa-tractor', order: 2 },
  { name: 'Textiles', description: 'Fabrics, garments, and textile manufacturing equipment', icon: 'fas fa-tshirt', order: 3 },
  { name: 'Electronics', description: 'Consumer electronics and industrial components', icon: 'fas fa-microchip', order: 4 }
];

const dummyBrands = [
  { name: 'TechMaster', description: 'Leading electronics manufacturer', country: 'USA' },
  { name: 'AgriPro', description: 'Premium agricultural tools and supplies', country: 'Germany' },
  { name: 'BuildStrong', description: 'Durable construction materials', country: 'China' },
  { name: 'WeaveCraft', description: 'High-quality textile products', country: 'India' }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Supplier.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    console.log('Database cleared.');

    console.log('Inserting Categories and Brands...');
    const createdCategories = await Category.insertMany(dummyCategories);
    const createdBrands = await Brand.insertMany(dummyBrands);
    console.log('Categories and Brands added.');

    console.log('Inserting Users...');
    // The pre('save') hook in User hashes the password. We should use .save() for users
    // or manually hash before insertMany. It's safer to use .save() to trigger hooks.
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@nexarion.com',
      password: 'Password123!',
      role: 'admin',
      adminRole: 'super-admin',
      phone: '+1234567890',
      isVerified: true,
      isActive: true
    });
    await adminUser.save();

    const buyer1 = new User({
      name: 'John Buyer',
      email: 'buyer1@example.com',
      password: 'Password123!',
      role: 'buyer',
      phone: '+1987654321',
      isVerified: true
    });
    await buyer1.save();

    const supplierUser1 = new User({
      name: 'Alice Supplier',
      email: 'supplier1@nexarion.com',
      password: 'Password123!',
      role: 'supplier',
      phone: '+1122334455',
      isVerified: true
    });
    await supplierUser1.save();

    const supplierUser2 = new User({
      name: 'Bob Supplier',
      email: 'supplier2@nexarion.com',
      password: 'Password123!',
      role: 'supplier',
      phone: '+15544332211',
      isVerified: true
    });
    await supplierUser2.save();
    console.log('Users added.');

    console.log('Inserting Suppliers...');
    const supplier1 = await Supplier.create({
      user: supplierUser1._id,
      companyName: 'Global Machineries Ltd',
      businessType: 'Manufacturer',
      country: 'USA',
      city: 'New York',
      address: '123 Industrial Park',
      verificationStatus: 'verified',
      description: 'Leading manufacturer of industrial equipment.',
      rating: 4.8
    });

    const supplier2 = await Supplier.create({
      user: supplierUser2._id,
      companyName: 'AgriCorp Exports',
      businessType: 'Wholesaler',
      country: 'Canada',
      city: 'Toronto',
      address: '456 Farm Road',
      verificationStatus: 'verified',
      description: 'Premium exporter of agricultural products.',
      rating: 4.5
    });
    console.log('Suppliers added.');

    console.log('Inserting Products...');
    const dummyProducts = [
      {
        name: 'Industrial CNC Lathe Machine',
        description: 'High-precision CNC lathe machine for metalworking. Features advanced automated controls, high-speed spindle, and robust construction for heavy-duty industrial applications.',
        shortDescription: 'High-precision CNC lathe for metalworking.',
        sku: 'MACH-CNC-001',
        category: createdCategories[0]._id, // Industrial Machinery
        supplier: supplier1._id,
        brand: createdBrands[0]._id, // TechMaster
        price: 25000,
        currency: 'USD',
        moq: 1,
        unit: 'piece',
        stock: 50,
        images: [
          { public_id: 'placeholder1', url: 'https://placehold.co/600x400/1a1a1a/ffffff?text=CNC+Lathe' },
          { public_id: 'placeholder2', url: 'https://placehold.co/600x400/333333/ffffff?text=Machine+View+2' }
        ],
        specifications: [
          { key: 'Voltage', value: '380V' },
          { key: 'Power', value: '15kW' }
        ],
        isActive: true,
        isFeatured: true,
        isApproved: 'approved'
      },
      {
        name: 'Heavy Duty Excavator X-200',
        description: 'Powerful hydraulic excavator designed for construction and mining. Comes with a reinforced boom, high capacity bucket, and efficient fuel consumption system.',
        shortDescription: '20-ton class hydraulic excavator.',
        sku: 'EXC-X200',
        category: createdCategories[0]._id, // Industrial Machinery
        supplier: supplier1._id,
        brand: createdBrands[2]._id, // BuildStrong
        price: 85000,
        currency: 'USD',
        moq: 1,
        unit: 'piece',
        stock: 12,
        images: [
          { public_id: 'placeholder3', url: 'https://placehold.co/600x400/f39c12/ffffff?text=Excavator' }
        ],
        isActive: true,
        isApproved: 'approved'
      },
      {
        name: 'Premium Organic Cotton Bales',
        description: '100% certified organic cotton bales directly from sustainable farms. High fiber strength and excellent purity for premium textile manufacturing.',
        shortDescription: 'Organic cotton bales for textile manufacturing.',
        sku: 'AGRI-COT-001',
        category: createdCategories[1]._id, // Agriculture
        supplier: supplier2._id,
        brand: createdBrands[3]._id, // WeaveCraft
        price: 1500,
        currency: 'USD',
        moq: 10,
        unit: 'bale',
        stock: 500,
        images: [
          { public_id: 'placeholder4', url: 'https://placehold.co/600x400/ecf0f1/2c3e50?text=Cotton+Bales' }
        ],
        isActive: true,
        isApproved: 'approved'
      },
      {
        name: 'Automated Irrigation System Pro',
        description: 'Smart irrigation system with soil moisture sensors, weather forecasting integration, and mobile app control for optimal water usage.',
        shortDescription: 'Smart automated irrigation system.',
        sku: 'AGRI-IRR-002',
        category: createdCategories[1]._id, // Agriculture
        supplier: supplier2._id,
        brand: createdBrands[1]._id, // AgriPro
        price: 4500,
        currency: 'USD',
        moq: 5,
        unit: 'system',
        stock: 100,
        images: [
          { public_id: 'placeholder5', url: 'https://placehold.co/600x400/2ecc71/ffffff?text=Irrigation+System' }
        ],
        isActive: true,
        isApproved: 'approved'
      },
      {
        name: 'Industrial Sewing Machine',
        description: 'High-speed industrial sewing machine for garment factories. Features automatic thread trimmer, programmable stitching patterns, and energy-saving motor.',
        shortDescription: 'High-speed industrial sewing machine.',
        sku: 'TEX-SEW-001',
        category: createdCategories[2]._id, // Textiles
        supplier: supplier1._id,
        brand: createdBrands[3]._id, // WeaveCraft
        price: 1200,
        currency: 'USD',
        moq: 20,
        unit: 'piece',
        stock: 200,
        images: [
          { public_id: 'placeholder6', url: 'https://placehold.co/600x400/bdc3c7/2c3e50?text=Sewing+Machine' }
        ],
        isActive: true,
        isFeatured: true,
        isApproved: 'approved'
      }
    ];

    const createdProducts = await Product.insertMany(dummyProducts);
    console.log('Products added.');

    console.log('Inserting Orders...');
    const order1 = await Order.create({
      buyer: buyer1._id,
      supplier: supplier1._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          quantity: 2,
          price: createdProducts[0].price,
          image: createdProducts[0].images[0].url
        }
      ],
      shippingAddress: {
        fullName: 'John Buyer',
        phone: '+1987654321',
        city: 'Los Angeles',
        country: 'USA'
      },
      pricing: {
        itemsPrice: 50000,
        taxPrice: 2500,
        shippingPrice: 1000,
        totalPrice: 53500
      },
      orderStatus: 'Confirmed',
      paymentStatus: 'Paid',
      isPaid: true,
      paidAt: Date.now()
    });

    const order2 = await Order.create({
      buyer: buyer1._id,
      supplier: supplier2._id,
      orderItems: [
        {
          product: createdProducts[2]._id,
          name: createdProducts[2].name,
          quantity: 20,
          price: createdProducts[2].price,
          image: createdProducts[2].images[0].url
        }
      ],
      shippingAddress: {
        fullName: 'John Buyer',
        phone: '+1987654321',
        city: 'Los Angeles',
        country: 'USA'
      },
      pricing: {
        itemsPrice: 30000,
        taxPrice: 1500,
        shippingPrice: 500,
        totalPrice: 32000
      },
      orderStatus: 'Pending',
      paymentStatus: 'Pending'
    });
    console.log('Orders added.');

    console.log('Inserting Reviews...');
    await Review.create({
      product: createdProducts[0]._id,
      user: buyer1._id,
      supplier: supplier1._id,
      order: order1._id,
      rating: 5,
      title: 'Excellent Machine',
      comment: 'The CNC lathe exceeded our expectations. Precision is fantastic and setup was straightforward.',
      isApproved: true
    });
    console.log('Reviews added.');

    console.log('====================================');
    console.log('SEEDING COMPLETE! 🎉');
    console.log('====================================');
    console.log('Test Credentials:');
    console.log('Admin Email: admin@nexarion.com');
    console.log('Admin Password: Password123!');
    console.log('Buyer Email: buyer1@example.com');
    console.log('Buyer Password: Password123!');
    console.log('Supplier Email: supplier1@nexarion.com');
    console.log('Supplier Password: Password123!');
    console.log('====================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
