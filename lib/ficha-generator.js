export async function generateFicha(data) {
  const PDFDocument = (await import('pdfkit')).default;
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ bufferPages: true, margin: 40 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const colors = {
        black: '#000000',
        red: '#CC3333',
        lightGray: '#F5F5F5',
        darkGray: '#333333',
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper functions
      const addTitle = (title) => {
        doc.fontSize(16).font('Helvetica-Bold').fillColor(colors.black).text(title, margin, yPos);
        yPos += 24;
      };

      const addSectionHeader = (header) => {
        yPos += 8;
        doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.red).text(header, margin, yPos);
        yPos += 18;
      };

      const addField = (label, value, inline = false) => {
        const labelX = margin;
        const valueX = inline ? labelX + 180 : labelX;
        const valueY = inline ? yPos : yPos + 16;

        doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.red).text(label + ':', labelX, yPos, { width: 170 });
        doc.fontSize(11).font('Helvetica').fillColor(colors.black).text(value || '___', valueX, valueY, { width: contentWidth - (valueX - margin) });

        if (!inline) yPos += 28;
      };

      const addFieldInline = (label, value) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.red).text(label + ':', margin, yPos);
        doc.fontSize(11).font('Helvetica').fillColor(colors.black).text(value || '___', margin + 150, yPos);
        yPos += 18;
      };

      const drawTableRow = (col1, col1Width, col2, col2Width, col3 = '', col3Width = 0, isHeader = false) => {
        const rowHeight = 24;
        const cellY = yPos;

        // Draw borders
        doc.lineWidth(1).strokeColor(colors.red);
        doc.rect(margin, cellY, col1Width, rowHeight).stroke();
        doc.rect(margin + col1Width, cellY, col2Width, rowHeight).stroke();
        if (col3Width > 0) {
          doc.rect(margin + col1Width + col2Width, cellY, col3Width, rowHeight).stroke();
        }

        // Fill header background
        if (isHeader) {
          doc.fillColor(colors.lightGray);
          doc.rect(margin, cellY, col1Width, rowHeight).fill();
          doc.rect(margin + col1Width, cellY, col2Width, rowHeight).fill();
          if (col3Width > 0) {
            doc.rect(margin + col1Width + col2Width, cellY, col3Width, rowHeight).fill();
          }
        }

        // Add text
        const fontSize = isHeader ? 10 : 9;
        const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';
        doc.fontSize(fontSize).font(font).fillColor(colors.black);

        doc.text(col1, margin + 4, cellY + 6, { width: col1Width - 8, height: rowHeight - 12 });
        doc.text(col2, margin + col1Width + 4, cellY + 6, { width: col2Width - 8, height: rowHeight - 12 });
        if (col3Width > 0) {
          doc.text(col3, margin + col1Width + col2Width + 4, cellY + 6, { width: col3Width - 8, height: rowHeight - 12 });
        }

        yPos += rowHeight;
      };

      // === HEADER ===
      doc.fillColor(colors.black).rect(0, 0, pageWidth, 60).fill();
      doc.fontSize(20).font('Helvetica-Bold').fillColor(colors.red).text('FICHA PRODUCTO', margin, 18);
      doc.fontSize(10).font('Helvetica').fillColor('white').text('🏠 Property Listing Sheet', margin, 38);
      yPos = 80;

      // === PRICING SECTION ===
      addSectionHeader('Price & Agent');
      addFieldInline('Price (€)', data.ficha?.price ? Number(data.ficha.price).toLocaleString('es-ES') : '___');
      addFieldInline('Agent', data.agentName || '___');
      addFieldInline('Date', data.ficha?.date ? new Date(data.ficha.date + 'T12:00:00').toLocaleDateString('es-ES') : '___');

      // === PROPERTY HEADER SECTION ===
      addSectionHeader('Property Information');
      addField('Address', data.ficha?.address);
      addField('City', data.ficha?.city);
      addField('Owner', data.ficha?.owner);
      addFieldInline('Phone / Email', data.ficha?.phone || '___');
      addFieldInline('Type', data.ficha?.propertyType || 'Villa');

      // === COSTS TABLE ===
      addSectionHeader('Annual / Monthly Costs');
      yPos += 4;
      const costCols = [
        { label: 'Cost Type', width: 100 },
        { label: 'Amount / Period', width: 150 },
      ];
      drawTableRow('Cost Type', 100, 'Amount / Period', 150, '', 0, true);

      const costs = [
        { label: 'IBI (Property Tax / year)', value: data.ficha?.ibi ? Number(data.ficha.ibi).toLocaleString('es-ES') + ' €/year' : '___' },
        { label: 'Community / month', value: data.ficha?.community ? Number(data.ficha.community).toLocaleString('es-ES') + ' €/month' : '___' },
        { label: 'Garbage / year', value: data.ficha?.garbage ? Number(data.ficha.garbage).toLocaleString('es-ES') + ' €/year' : '___' },
        { label: 'Water Bill / month', value: data.ficha?.water ? Number(data.ficha.water).toLocaleString('es-ES') + ' €/month' : '___' },
        { label: 'Electricity Bill / month', value: data.ficha?.electricity ? Number(data.ficha.electricity).toLocaleString('es-ES') + ' €/month' : '___' },
      ];

      costs.forEach(cost => {
        drawTableRow(cost.label, 100, cost.value, 150);
      });

      yPos += 12;

      // === PROPERTY DETAILS TABLE ===
      addSectionHeader('Property Details');
      yPos += 4;
      drawTableRow('Feature', 100, 'Value', 150, '', 0, true);

      const details = [
        { label: 'Plot Size (m²)', value: data.ficha?.plotM2 || '___' },
        { label: 'Surface Built (m²)', value: data.ficha?.surfaceBuilt || '___' },
        { label: 'Year Built', value: data.ficha?.builtYear || '___' },
        { label: 'Orientation', value: data.ficha?.orientation || '___' },
        { label: 'Floors', value: data.ficha?.floors || '___' },
        { label: 'Time on Market', value: data.ficha?.timeOnMarket || '___' },
        { label: 'Bedrooms', value: data.ficha?.bedrooms || '___' },
        { label: 'Bathrooms', value: data.ficha?.bathrooms || '___' },
        { label: 'Toilets', value: data.ficha?.toilets || '___' },
        { label: 'Heating', value: data.ficha?.heating || '___' },
        { label: 'Parkings', value: data.ficha?.parkings || '___' },
        { label: 'Refurbished Year', value: data.ficha?.refurbishedYear || '___' },
      ];

      details.forEach(detail => {
        drawTableRow(detail.label, 100, detail.value, 150);
      });

      yPos += 12;

      // === FEATURES SECTION ===
      addSectionHeader('Features & Amenities');
      yPos += 4;

      const features = [
        { label: 'Upload on WEB', value: data.ficha?.uploadWeb || 'No' },
        { label: 'Upload on IDEALISTA', value: data.ficha?.uploadIdealista || 'No' },
        { label: 'Underground Parking', value: data.ficha?.underground || 'No' },
        { label: 'Views', value: data.ficha?.views || 'None' },
        { label: 'Covered Garage', value: data.ficha?.coveredGarage || 'No' },
        { label: 'Guest Apartment', value: data.ficha?.guestApartment || 'No' },
        { label: 'Air Conditioning', value: data.ficha?.airConditioning || 'No' },
        { label: 'Swimming Pool', value: data.ficha?.swimmingPool || 'No' },
        { label: 'Furniture Included', value: data.ficha?.furnitureIncluded || 'No' },
        { label: 'Lift', value: data.ficha?.lift || 'No' },
        { label: 'Garden', value: data.ficha?.garden || 'No' },
        { label: 'Tourist Licence', value: data.ficha?.touristLicence || 'No' },
        { label: 'CBI Sign outside', value: data.ficha?.cbiSign || 'No' },
        { label: 'Do we have keys', value: data.ficha?.haveKeys || 'No' },
      ];

      drawTableRow('Feature', 100, 'Status', 150, '', 0, true);
      features.forEach(feature => {
        const icon = ['Yes', 'yes', 'Sí', 'sí'].includes(feature.value) ? '✓' : ['No', 'no'].includes(feature.value) ? '✗' : '';
        const displayValue = icon ? `${icon} ${feature.value}` : feature.value;
        drawTableRow(feature.label, 100, displayValue, 150);
      });

      yPos += 12;

      // === REQUESTED DOCUMENTS ===
      addSectionHeader('Requested Documents');
      const docChecks = [
        { label: 'NIEs', checked: data.ficha?.nies },
        { label: 'DNI / Passports', checked: data.ficha?.dniPassports },
        { label: 'Escritura (Purchase Deed)', checked: data.ficha?.escritura },
        { label: 'Floor Plans', checked: data.ficha?.floorPlans },
        { label: 'CEE (Energy Certificate)', checked: data.ficha?.cee },
      ];

      docChecks.forEach(docItem => {
        const checkbox = docItem.checked ? '☑' : '☐';
        doc.fontSize(10).font('Helvetica').fillColor(colors.black).text(`${checkbox} ${docItem.label}`, margin, yPos);
        yPos += 18;
      });

      yPos += 8;

      // === EXTRA COMMENTS ===
      if (data.ficha?.extraComments?.trim()) {
        addSectionHeader('Extra Comments');
        doc.fontSize(10).font('Helvetica').fillColor(colors.black).text(data.ficha.extraComments, margin, yPos, { width: contentWidth });
        yPos += 50;
      }

      // === FOOTER ===
      doc.fontSize(9).font('Helvetica').fillColor(colors.darkGray).text('Costa Blanca Luxury Investments - Generated by CBLI Contract System', margin, pageHeight - 30, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
