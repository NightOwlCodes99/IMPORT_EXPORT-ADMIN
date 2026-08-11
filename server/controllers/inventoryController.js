const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ErrorResponse } = require('../middleware/error');
const { sendInventoryAlertEmail, sendStockUpdateEmail } = require('../config/email');

// @desc    Get inventory overview/stats
// @route   GET /api/inventory/overview
// @access  Private/Admin
exports.getInventoryOverview = asyncHandler(async (req, res, next) => {
  // Get total products count
  const totalProducts = await Product.countDocuments();
  
  // Get products by stock status
  const inStock = await Product.countDocuments({ stock: { $gt: 10 } });
  const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });
  const outOfStock = await Product.countDocuments({ stock: 0 });
  
  // Get total stock value (price * stock)
  const stockValueResult = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        totalUnits: { $sum: '$stock' }
      }
    }
  ]);
  
  const stockValue = stockValueResult[0]?.totalValue || 0;
  const totalUnits = stockValueResult[0]?.totalUnits || 0;
  
  // Get products by category stock
  const categoryStock = await Product.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        totalStock: { $sum: '$stock' },
        productCount: { $sum: 1 },
        stockValue: { $sum: { $multiply: ['$price', '$stock'] } }
      }
    },
    {
      $sort: { totalStock: -1 }
    },
    {
      $limit: 10
    }
  ]);
  
  // Get recent stock movements (from recent orders)
  const recentMovements = await Order.find({ status: { $in: ['Delivered', 'Shipped'] } })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('buyer', 'name email')
    .select('orderId items totalPrice status updatedAt');

  // Get low stock alerts
  const lowStockProducts = await Product.find({ stock: { $lte: 10 }, isActive: true })
    .populate('category', 'name')
    .select('name sku stock moq price images')
    .sort({ stock: 1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        stockValue,
        totalUnits
      },
      categoryStock,
      lowStockProducts,
      recentMovements
    }
  });
});

// @desc    Get all inventory items with pagination and filters
// @route   GET /api/inventory
// @access  Private/Admin
exports.getInventoryItems = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    category = '',
    stockStatus = '', // 'in_stock', 'low_stock', 'out_of_stock'
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  let query = { isActive: true };

  // Search by name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by stock status
  if (stockStatus === 'in_stock') {
    query.stock = { $gt: 10 };
  } else if (stockStatus === 'low_stock') {
    query.stock = { $gt: 0, $lte: 10 };
  } else if (stockStatus === 'out_of_stock') {
    query.stock = 0;
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get total count
  const total = await Product.countDocuments(query);

  // Get products
  const products = await Product.find(query)
    .populate('category', 'name')
    .populate('brand', 'name')
    .populate('supplier', 'companyName')
    .select('name sku stock price moq unit images category brand supplier createdAt updatedAt')
    .sort(sort)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Update stock for a product
// @route   PUT /api/inventory/:id/stock
// @access  Private/Admin
exports.updateInventoryStock = asyncHandler(async (req, res, next) => {
  const { stock, reason, notifyUser } = req.body;

  if (stock === undefined || stock < 0) {
    return next(new ErrorResponse('Please provide a valid stock quantity', 400));
  }

  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('supplier', 'companyName email');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id ${req.params.id}`, 404));
  }

  const previousStock = product.stock;
  const stockChange = stock - previousStock;
  const changeType = stockChange > 0 ? 'increase' : stockChange < 0 ? 'decrease' : 'no_change';

  // Update stock
  product.stock = stock;
  await product.save();

  // Send notification email if requested and stock change occurred
  if (notifyUser && product.supplier?.email && stockChange !== 0) {
    try {
      await sendStockUpdateEmail({
        supplierEmail: product.supplier.email,
        supplierName: product.supplier.companyName,
        productName: product.name,
        productSku: product.sku,
        previousStock,
        newStock: stock,
        changeType,
        reason: reason || 'Stock adjustment by admin',
        updatedBy: req.user.name
      });
    } catch (emailError) {
      
    }
  }

  // Check for low stock and send alert
  if (stock <= 10 && previousStock > 10) {
    try {
      await sendInventoryAlertEmail({
        productName: product.name,
        productSku: product.sku,
        currentStock: stock,
        alertType: 'low_stock',
        threshold: 10
      });
    } catch (emailError) {
      
    }
  }

  res.status(200).json({
    success: true,
    message: `Stock updated from ${previousStock} to ${stock}`,
    data: {
      product,
      stockChange: {
        previous: previousStock,
        current: stock,
        difference: stockChange,
        type: changeType
      }
    }
  });
});

// @desc    Bulk update stock
// @route   PUT /api/inventory/bulk-update
// @access  Private/Admin
exports.bulkUpdateStock = asyncHandler(async (req, res, next) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return next(new ErrorResponse('Please provide an array of updates', 400));
  }

  const results = {
    success: [],
    failed: []
  };

  for (const update of updates) {
    try {
      const { productId, stock, reason } = update;
      
      if (!productId || stock === undefined || stock < 0) {
        results.failed.push({
          productId,
          error: 'Invalid data'
        });
        continue;
      }

      const product = await Product.findById(productId);
      if (!product) {
        results.failed.push({
          productId,
          error: 'Product not found'
        });
        continue;
      }

      const previousStock = product.stock;
      product.stock = stock;
      await product.save();

      results.success.push({
        productId,
        name: product.name,
        sku: product.sku,
        previousStock,
        newStock: stock
      });
    } catch (error) {
      results.failed.push({
        productId: update.productId,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    message: `${results.success.length} products updated, ${results.failed.length} failed`,
    data: results
  });
});

// @desc    Add stock (new arrival)
// @route   POST /api/inventory/:id/add-stock
// @access  Private/Admin
exports.addStock = asyncHandler(async (req, res, next) => {
  const { quantity, reason, supplierReference, arrivalDate, notifySupplier } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new ErrorResponse('Please provide a valid quantity to add', 400));
  }

  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('supplier', 'companyName email');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id ${req.params.id}`, 404));
  }

  const previousStock = product.stock;
  const newStock = previousStock + quantity;

  product.stock = newStock;
  await product.save();

  // Send notification to supplier if requested
  if (notifySupplier && product.supplier?.email) {
    try {
      await sendStockUpdateEmail({
        supplierEmail: product.supplier.email,
        supplierName: product.supplier.companyName,
        productName: product.name,
        productSku: product.sku,
        previousStock,
        newStock,
        changeType: 'arrival',
        reason: reason || 'New stock arrival',
        supplierReference,
        arrivalDate: arrivalDate || new Date(),
        updatedBy: req.user.name
      });
    } catch (emailError) {
      
    }
  }

  res.status(200).json({
    success: true,
    message: `Added ${quantity} units. New stock: ${newStock}`,
    data: {
      product,
      stockMovement: {
        type: 'arrival',
        quantityAdded: quantity,
        previousStock,
        newStock,
        reason,
        supplierReference,
        arrivalDate,
        recordedBy: req.user.name,
        recordedAt: new Date()
      }
    }
  });
});

// @desc    Reduce stock (order completion / damage / etc)
// @route   POST /api/inventory/:id/reduce-stock
// @access  Private/Admin
exports.reduceStock = asyncHandler(async (req, res, next) => {
  const { quantity, reason, orderId } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new ErrorResponse('Please provide a valid quantity to reduce', 400));
  }

  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('supplier', 'companyName email');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id ${req.params.id}`, 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse(`Insufficient stock. Available: ${product.stock}`, 400));
  }

  const previousStock = product.stock;
  const newStock = previousStock - quantity;

  product.stock = newStock;
  await product.save();

  // Send low stock alert if needed
  if (newStock <= 10 && previousStock > 10) {
    try {
      await sendInventoryAlertEmail({
        productName: product.name,
        productSku: product.sku,
        currentStock: newStock,
        alertType: 'low_stock',
        threshold: 10
      });
    } catch (emailError) {
      
    }
  }

  // Send out of stock alert
  if (newStock === 0) {
    try {
      await sendInventoryAlertEmail({
        productName: product.name,
        productSku: product.sku,
        currentStock: 0,
        alertType: 'out_of_stock'
      });
    } catch (emailError) {
      
    }
  }

  res.status(200).json({
    success: true,
    message: `Reduced ${quantity} units. New stock: ${newStock}`,
    data: {
      product,
      stockMovement: {
        type: 'reduction',
        quantityReduced: quantity,
        previousStock,
        newStock,
        reason: reason || 'Stock reduction by admin',
        orderId,
        recordedBy: req.user.name,
        recordedAt: new Date()
      }
    }
  });
});

// @desc    Get stock history/movements for a product
// @route   GET /api/inventory/:id/history
// @access  Private/Admin
exports.getStockHistory = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .select('name sku stock price images');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id ${req.params.id}`, 404));
  }

  // Get orders containing this product
  const orders = await Order.find({
    'items.product': req.params.id,
    status: { $in: ['Delivered', 'Shipped', 'Processing'] }
  })
    .populate('buyer', 'name email')
    .select('orderId items status createdAt updatedAt totalPrice')
    .sort({ createdAt: -1 })
    .limit(50);

  // Extract stock movements from orders
  const movements = orders.map(order => {
    const item = order.items.find(i => i.product?.toString() === req.params.id);
    return {
      type: 'order',
      orderId: order.orderId,
      quantity: item?.quantity || 0,
      status: order.status,
      buyer: order.buyer,
      date: order.createdAt
    };
  });

  res.status(200).json({
    success: true,
    data: {
      product,
      movements
    }
  });
});

// @desc    Export inventory report
// @route   GET /api/inventory/export
// @access  Private/Admin
exports.exportInventory = asyncHandler(async (req, res, next) => {
  const { format = 'json' } = req.query;

  const products = await Product.find({ isActive: true })
    .populate('category', 'name')
    .populate('brand', 'name')
    .populate('supplier', 'companyName')
    .select('name sku stock price moq unit category brand supplier createdAt')
    .sort({ name: 1 });

  const exportData = products.map(p => ({
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    price: p.price,
    moq: p.moq,
    unit: p.unit,
    category: p.category?.name || 'N/A',
    brand: p.brand?.name || 'N/A',
    supplier: p.supplier?.companyName || 'N/A',
    stockValue: p.price * p.stock,
    status: p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock'
  }));

  if (format === 'csv') {
    const headers = ['Name', 'SKU', 'Stock', 'Price', 'MOQ', 'Unit', 'Category', 'Brand', 'Supplier', 'Stock Value', 'Status'];
    const csvRows = [headers.join(',')];
    
    exportData.forEach(item => {
      csvRows.push([
        `"${item.name}"`,
        item.sku,
        item.stock,
        item.price,
        item.moq,
        item.unit,
        `"${item.category}"`,
        `"${item.brand}"`,
        `"${item.supplier}"`,
        item.stockValue,
        item.status
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inventory-${Date.now()}.csv`);
    return res.send(csvRows.join('\n'));
  }

  res.status(200).json({
    success: true,
    count: exportData.length,
    data: exportData
  });
});

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private/Admin
exports.getLowStockAlerts = asyncHandler(async (req, res, next) => {
  const { threshold = 10 } = req.query;

  const lowStockProducts = await Product.find({
    stock: { $lte: parseInt(threshold) },
    isActive: true
  })
    .populate('category', 'name')
    .populate('supplier', 'companyName email')
    .select('name sku stock moq price images category supplier')
    .sort({ stock: 1 });

  const outOfStockCount = lowStockProducts.filter(p => p.stock === 0).length;
  const lowStockCount = lowStockProducts.filter(p => p.stock > 0).length;

  res.status(200).json({
    success: true,
    data: {
      threshold: parseInt(threshold),
      outOfStockCount,
      lowStockCount,
      totalAlerts: lowStockProducts.length,
      products: lowStockProducts
    }
  });
});
