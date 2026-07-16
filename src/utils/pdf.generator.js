const PDFDocument = require('pdfkit');

/**
 * Generates a dynamic PDF of product details including brands and total price
 * @param {Object} product - Product details along with its brands
 * @param {WritableStream} outputStream - Express response or filesystem write stream
 */
const generateProductPDF = (product, outputStream) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Pipe PDF stream
  doc.pipe(outputStream);

  // Logo / Title banner area
  doc.rect(50, 45, 495, 45).fillColor('#1e293b').fill();
  doc.fontSize(16).fillColor('#ffffff').font('Helvetica-Bold').text('PRODUCT SPECIFICATIONS SHEET', 60, 60);

  // Date and Time
  doc.fontSize(8).fillColor('#cccccc').font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, 400, 64, { align: 'right' });

  // Restore fill color
  doc.fillColor('#333333');
  doc.y = 110;

  // Product Basic Info
  doc.fontSize(12).font('Helvetica-Bold').text('Product Name: ', { continued: true }).font('Helvetica').text(product.name);
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica-Bold').text('Product Description:');
  doc.fontSize(10).font('Helvetica').fillColor('#4b5563').text(product.description, { width: 495, align: 'justify' });
  doc.moveDown(1.5);

  // Divider Line
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(1);

  // Brands Header
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Associated Brands');
  doc.moveDown(0.5);

  let totalPrice = 0;

  product.brands.forEach((brand, index) => {
    totalPrice += brand.price;

    const brandStartY = doc.y;

    // Brand Box Boundary
    doc.rect(50, brandStartY, 495, 120).strokeColor('#f3f4f6').stroke();

    // Brand Information Content (Left Aligned inside Box)
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2563eb').text(`${index + 1}. Brand: ${brand.name}`, 60, brandStartY + 10);
    doc.fontSize(9).font('Helvetica').fillColor('#4b5563').text(`Detail: ${brand.detail}`, 60, brandStartY + 30, { width: 320 });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text(`Price: $${brand.price.toFixed(2)}`, 60, brandStartY + 90);

    // Brand Image (Right Aligned inside Box if provided)
    if (brand.image) {
      try {
        if (brand.image.startsWith('data:image')) {
          // Extract base64 image data
          const base64Data = brand.image.replace(/^data:image\/\w+;base64,/, '');
          const imgBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imgBuffer, 400, brandStartY + 10, { fit: [100, 100], align: 'center' });
        } else if (brand.image.startsWith('http://') || brand.image.startsWith('https://')) {
          // For web URLs, write URL label
          doc.fontSize(8).font('Helvetica').fillColor('#6b7280').text('[Remote Image URL]', 400, brandStartY + 10);
          doc.fontSize(8).fillColor('#2563eb').text(brand.image, 400, brandStartY + 25, { width: 130 });
        } else {
          doc.fontSize(8).font('Helvetica').fillColor('#6b7280').text(`[Image Path: ${brand.image}]`, 400, brandStartY + 10);
        }
      } catch (imgError) {
        doc.fontSize(8).font('Helvetica').fillColor('#ef4444').text(`[Error loading image: ${imgError.message}]`, 400, brandStartY + 10);
      }
    }

    // Move cursor down after the box
    doc.y = brandStartY + 130;
  });

  // Calculate position check for bottom of page to prevent clipping
  if (doc.y > 700) {
    doc.addPage();
  }

  // Summary and Total Price
  const totalBoxY = doc.y;
  doc.rect(50, totalBoxY, 495, 40).fillColor('#f8fafc').fill();
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Total Calculated Price:', 60, totalBoxY + 15);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text(`$${totalPrice.toFixed(2)}`, 400, totalBoxY + 13, { align: 'right', width: 130 });

  // Finalize PDF Document
  doc.end();
};

module.exports = {
  generateProductPDF,
};
