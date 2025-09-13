import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class PDFExporter {
  constructor() {
    this.defaultOptions = {
      margin: 50,
      fontSize: 12,
      lineHeight: 1.4,
      pageWidth: 595.28, // A4 width in points
      pageHeight: 841.89, // A4 height in points
    };
  }

  async convertToPDF(data, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    const doc = new PDFDocument({
      size: 'A4',
      margin: config.margin,
      info: {
        Title: options.title || 'Report',
        Author: options.author || 'BI Analytics System',
        Subject: options.subject || 'Generated Report',
        Creator: 'ERP BI Analytics System',
        CreationDate: new Date(),
      }
    });

    // Create a buffer to store the PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on('error', reject);

      try {
        this.generatePDFContent(doc, data, config);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  generatePDFContent(doc, data, config) {
    const { title, reportType, generatedAt, data: reportData } = data;

    // Header
    this.addHeader(doc, title || 'Report', config);
    
    // Report metadata
    this.addMetadata(doc, { reportType, generatedAt }, config);
    
    // Content based on report type
    if (reportData) {
      this.addReportData(doc, reportData, config);
    }

    // Footer
    this.addFooter(doc, config);
  }

  addHeader(doc, title, config) {
    // Company logo placeholder (you can add actual logo)
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(title, config.margin, config.margin)
       .moveDown(0.5);

    // Add a line separator
    doc.strokeColor('#cccccc')
       .lineWidth(1)
       .moveTo(config.margin, doc.y)
       .lineTo(config.pageWidth - config.margin, doc.y)
       .stroke()
       .moveDown(1);
  }

  addMetadata(doc, metadata, config) {
    const { reportType, generatedAt } = metadata;
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Report Type: ${reportType || 'N/A'}`, config.margin, doc.y)
       .text(`Generated: ${generatedAt ? new Date(generatedAt).toLocaleString() : 'N/A'}`, config.margin, doc.y + 15)
       .moveDown(1);
  }

  addReportData(doc, data, config) {
    if (Array.isArray(data)) {
      this.addTableData(doc, data, config);
    } else if (typeof data === 'object') {
      this.addObjectData(doc, data, config);
    } else {
      this.addTextData(doc, data, config);
    }
  }

  addTableData(doc, data, config) {
    if (data.length === 0) {
      doc.fontSize(12)
         .font('Helvetica')
         .text('No data available', config.margin, doc.y);
      return;
    }

    // Get column headers from first row
    const headers = Object.keys(data[0]);
    const columnWidth = (config.pageWidth - 2 * config.margin) / headers.length;
    const rowHeight = 20;

    // Table headers
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#333333');

    let currentY = doc.y;
    headers.forEach((header, index) => {
      const x = config.margin + (index * columnWidth);
      doc.text(header, x, currentY, { width: columnWidth - 10, align: 'left' });
    });

    // Draw header line
    doc.strokeColor('#000000')
       .lineWidth(1)
       .moveTo(config.margin, currentY + rowHeight)
       .lineTo(config.pageWidth - config.margin, currentY + rowHeight)
       .stroke();

    currentY += rowHeight + 5;

    // Table data
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#000000');

    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (currentY > config.pageHeight - 100) {
        doc.addPage();
        currentY = config.margin;
      }

      headers.forEach((header, colIndex) => {
        const x = config.margin + (colIndex * columnWidth);
        const value = row[header] || '';
        doc.text(String(value), x, currentY, { width: columnWidth - 10, align: 'left' });
      });

      currentY += rowHeight;
    });
  }

  addObjectData(doc, data, config) {
    doc.fontSize(12)
       .font('Helvetica');

    Object.entries(data).forEach(([key, value]) => {
      if (doc.y > config.pageHeight - 100) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold')
         .text(`${key}:`, config.margin, doc.y)
         .font('Helvetica')
         .text(String(value), config.margin + 100, doc.y)
         .moveDown(0.5);
    });
  }

  addTextData(doc, data, config) {
    doc.fontSize(12)
       .font('Helvetica')
       .text(String(data), config.margin, doc.y, {
         width: config.pageWidth - 2 * config.margin,
         align: 'left'
       });
  }

  addFooter(doc, config) {
    const pageNumber = doc.bufferedPageRange().count;
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#666666')
       .text(
         `Page ${pageNumber} | Generated by ERP BI Analytics System`,
         config.margin,
         config.pageHeight - 30,
         { align: 'center' }
       );
  }

  // Utility method to save PDF to file
  async saveToFile(data, filename, options = {}) {
    const pdfBuffer = await this.convertToPDF(data, options);
    const filePath = path.join(process.cwd(), 'exports', filename);
    
    // Ensure exports directory exists
    const exportsDir = path.dirname(filePath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
  }
}

export default new PDFExporter();
