const fs = require('fs');
const path = require('path');
const app = require('../src/app');

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function runTests() {
  // Start temporary test server
  const server = app.listen(PORT, async () => {
    console.log(`\n=== Test Server started on port ${PORT} ===\n`);
    try {
      await executeFlow();
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      server.close(() => {
        console.log('\n=== Test Server stopped ===\n');
      });
    }
  });
}

async function executeFlow() {
  let adminToken = '';
  let sellerToken = '';
  let createdSellerEmail = `seller_${Date.now()}@example.com`;
  let createdSellerPassword = 'sellerPassword123';
  let createdProductId = '';

  // 1. Admin Login
  console.log('1. Testing Admin Login...');
  const adminLoginRes = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@prominno.com',
      password: 'admin123',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log('Response:', JSON.stringify(adminLoginData, null, 2));

  if (!adminLoginData.success) {
    throw new Error('Admin login failed. Did you seed the database? Run: npx prisma db seed');
  }
  adminToken = adminLoginData.token;

  // 2. Create Seller (Admin Protected)
  console.log('\n2. Testing Create Seller (Admin Only)...');
  const createSellerRes = await fetch(`${BASE_URL}/admin/sellers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Test Seller Node',
      email: createdSellerEmail,
      mobileNo: '9988776655',
      country: 'India',
      state: 'Delhi',
      skills: ['Sales', 'Negotiating', 'NodeJS'],
      password: createdSellerPassword,
    }),
  });
  const createSellerData = await createSellerRes.json();
  console.log('Response:', JSON.stringify(createSellerData, null, 2));

  // 3. List Sellers (Admin Protected)
  console.log('\n3. Testing Sellers List with Pagination...');
  const listSellersRes = await fetch(`${BASE_URL}/admin/sellers?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const listSellersData = await listSellersRes.json();
  console.log('Response Pagination Sellers count:', listSellersData.sellers ? listSellersData.sellers.length : 0);

  // 4. Seller Login
  console.log('\n4. Testing Seller Login...');
  const sellerLoginRes = await fetch(`${BASE_URL}/seller/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: createdSellerEmail,
      password: createdSellerPassword,
    }),
  });
  const sellerLoginData = await sellerLoginRes.json();
  console.log('Response:', JSON.stringify(sellerLoginData, null, 2));
  sellerToken = sellerLoginData.token;

  // 5. Add Product with Multiple Brands (Seller Protected)
  console.log('\n5. Testing Add Product with Multiple Brands (Seller Only)...');
  const addProductRes = await fetch(`${BASE_URL}/seller/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sellerToken}`,
    },
    body: JSON.stringify({
      name: 'Professional Laptop Mouse',
      description: 'Ergonomic wireless gaming and office mouse setup.',
      brands: [
        {
          brandName: 'Logitech G',
          detail: 'Superlight wireless mouse, 25k DPI sensor, black color',
          image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7',
          price: 150.0,
        },
        {
          brandName: 'Razer DeathAdder',
          detail: 'V3 Pro Wireless ergonomic gaming mouse, white color',
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          price: 130.0,
        },
      ],
    }),
  });
  const addProductData = await addProductRes.json();
  console.log('Response:', JSON.stringify(addProductData, null, 2));
  createdProductId = addProductData.product.id;

  // 6. Product Listing with Pagination
  console.log('\n6. Testing Product Listing for authenticated Seller...');
  const listProductsRes = await fetch(`${BASE_URL}/seller/products?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${sellerToken}` },
  });
  const listProductsData = await listProductsRes.json();
  console.log('Response Products Count:', listProductsData.products ? listProductsData.products.length : 0);

  // 7. View PDF for the Product (Dynamic Generator check)
  console.log('\n7. Testing View PDF generation...');
  const pdfRes = await fetch(`${BASE_URL}/seller/products/${createdProductId}/pdf`, {
    headers: { Authorization: `Bearer ${sellerToken}` },
  });

  if (pdfRes.status === 200) {
    const arrayBuffer = await pdfRes.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const pdfPath = path.join(outputDir, `product_${createdProductId}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`Response: PDF successfully generated and saved to: ${pdfPath}`);
  } else {
    const errorJson = await pdfRes.json();
    console.log('Response PDF Error:', errorJson);
  }

  // 8. Delete Product API (Seller Protected)
  console.log('\n8. Testing Delete Product API...');
  const deleteRes = await fetch(`${BASE_URL}/seller/products/${createdProductId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sellerToken}` },
  });
  const deleteData = await deleteRes.json();
  console.log('Response:', JSON.stringify(deleteData, null, 2));

  console.log('\n=== All Tests Finished Successfully! ===');
}

runTests();
