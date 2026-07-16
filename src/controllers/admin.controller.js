const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { adminLoginSchema, createSellerSchema } = require('../utils/validators');

// Admin Login
const login = async (req, res, next) => {
  try {
    const validatedData = adminLoginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email: validatedData.email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(validatedData.password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      role: admin.role,
    });
  } catch (error) {
    next(error);
  }
};

// Create Seller
const createSeller = async (req, res, next) => {
  try {
    const validatedData = createSellerSchema.parse(req.body);

    // Check if seller already exists
    const existingSeller = await prisma.seller.findUnique({
      where: { email: validatedData.email },
    });

    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered as a seller.',
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const seller = await prisma.seller.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        mobileNo: validatedData.mobileNo,
        country: validatedData.country,
        state: validatedData.state,
        skills: validatedData.skills,
        password: hashedPassword,
        role: 'seller',
      },
    });

    // Exclude password from response
    const { password, ...sellerResponse } = seller;

    return res.status(201).json({
      success: true,
      message: 'Seller created successfully.',
      seller: sellerResponse,
    });
  } catch (error) {
    next(error);
  }
};

// Listing of Sellers with Pagination
const listSellers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [sellers, total] = await prisma.$transaction([
      prisma.seller.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          mobileNo: true,
          country: true,
          state: true,
          skills: true,
          createdAt: true,
        },
      }),
      prisma.seller.count(),
    ]);

    return res.status(200).json({
      success: true,
      sellers,
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

module.exports = {
  login,
  createSeller,
  listSellers,
};
