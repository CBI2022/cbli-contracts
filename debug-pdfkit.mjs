const pdfkitModule = await import('pdfkit');
console.log('pdfkit module:', Object.keys(pdfkitModule));
const PDFDocument = pdfkitModule.default;
console.log('PDFDocument:', typeof PDFDocument);
console.log('PDFDocument.prototype:', Object.getOwnPropertyNames(PDFDocument.prototype).slice(0, 10));

const doc = new PDFDocument();
console.log('doc.fontSize:', typeof doc.fontSize);
