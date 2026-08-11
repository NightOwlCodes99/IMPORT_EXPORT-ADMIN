/**
 * Script to recalculate product ratings from existing reviews
 * Run with: node fix-ratings.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/Review');
const Product = require('./models/Product');
const connectDB = require('./config/database');

async function fixRatings() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get all reviews
    const reviews = await Review.find({});
    console.log(`Found ${reviews.length} total reviews`);

    // Group reviews by product
    const productIds = [...new Set(reviews.map(r => r.product.toString()))];
    console.log(`Reviews span ${productIds.length} products`);

    for (const productId of productIds) {
      const objectId = new mongoose.Types.ObjectId(productId);
      
      const stats = await Review.aggregate([
        { $match: { product: objectId } },
        { $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }}
      ]);

      if (stats.length > 0) {
        const result = await Product.findByIdAndUpdate(productId, {
          rating: Math.round(stats[0].avgRating * 10) / 10,
          totalReviews: stats[0].totalReviews
        }, { new: true });
        
        console.log(`Updated product ${productId}: rating=${result.rating}, reviews=${result.totalReviews}`);
      }
    }

    console.log('Done! All product ratings updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixRatings();
