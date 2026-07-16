const { z } = require('zod');

// Admin Login Schema
const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

// Create Seller Schema
const createSellerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  mobileNo: z.string()
    .min(10, { message: 'Mobile number must be at least 10 characters' })
    .max(15, { message: 'Mobile number cannot exceed 15 characters' }),
  country: z.string().min(1, { message: 'Country is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  skills: z.array(z.string()).min(1, { message: 'At least one skill must be specified' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

// Seller Login Schema
const sellerLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Brand Sub-schema for Add Product
const brandSchema = z.object({
  brandName: z.string().min(1, { message: 'Brand Name is required' }),
  detail: z.string().min(1, { message: 'Brand details are required' }),
  image: z.string().min(1, { message: 'Brand image URL/base64 is required' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
});

// Add Product Schema
const addProductSchema = z.object({
  name: z.string().min(1, { message: 'Product Name is required' }),
  description: z.string().min(1, { message: 'Product Description is required' }),
  brands: z.array(brandSchema).min(1, { message: 'At least one brand must be specified for the product' }),
});

module.exports = {
  adminLoginSchema,
  createSellerSchema,
  sellerLoginSchema,
  addProductSchema,
};
