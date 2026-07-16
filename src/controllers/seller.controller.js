const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { sellerLoginSchema, addProductSchema } = require('../utils/validators');
const { generateProductPDF } = require('../utils/pdf.generator');

// Seller Login
const login = async (req, res, next) => {
  try {
    const validatedData = sellerLoginSchema.parse(req.body);

    const seller = await prisma.seller.findUnique({
      where: { email: validatedData.email },
    });

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(validatedData.password, seller.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: seller.id, email: seller.email, role: seller.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      role: seller.role,
    });
  } catch (error) {
    next(error);
  }
};

// Add Product
const addProduct = async (req, res, next) => {
  try {
    const validatedData = addProductSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        sellerId: req.user.id,
        brands: {
          create: validatedData.brands.map((brand) => ({
            name: brand.brandName,
            detail: brand.detail,
            image: brand.image,
            price: brand.price,
          })),
        },
      },
      include: {
        brands: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully with brands.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Product Listing with Pagination (Authenticated Seller's products only)
const listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { sellerId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brands: true,
        },
      }),
      prisma.product.count({
        where: { sellerId: req.user.id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product API
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Authorization check
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this product.',
      });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.status(200).json({
      success: true,
      message: 'Product and all associated brands deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// View PDF API
const viewProductPDF = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brands: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Authorization check: only the seller who owns the product can view it
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view the PDF of this product.',
      });
    }

    // Set Response headers for streaming PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="product-${productId}.pdf"`);

    // Generate PDF and pipe to response
    generateProductPDF(product, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  addProduct,
  listProducts,
  deleteProduct,
  viewProductPDF,
};
