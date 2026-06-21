import PDFDocument from 'pdfkit';

export async function generateFicha(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const colors = {
        black: '#000000',
        red: '#CC3333',
        white: '#FFFFFF',
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper to draw a simple house icon
      const drawHouseIcon = (x, y, size = 20) => {
        // Roof (triangle)
        doc.strokeColor(colors.black).lineWidth(1.5);
        doc.moveTo(x, y + size * 0.6)
          .lineTo(x + size * 0.5, y)
          .lineTo(x + size, y + size * 0.6)
          .stroke();

        // House body (rectangle)
        doc.rect(x, y + size * 0.6, size, size * 0.4).stroke();

        // Door
        doc.rect(x + size * 0.35, y + size * 0.75, size * 0.3, size * 0.25).stroke();
      };

      // Helper to draw a circle
      const drawCircle = (x, y, radius) => {
        doc.circle(x, y, radius).stroke();
      };

      // Helper to check page break
      const checkPageBreak = (neededHeight) => {
        if (yPos + neededHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper to draw underline
      const drawUnderline = (x, y, width, height = 20) => {
        const lineY = y + height;
        doc.strokeColor(colors.black).lineWidth(0.5);
        doc.moveTo(x, lineY).lineTo(x + width, lineY).stroke();
      };

      // === PAGE 1 HEADER ===
      // Black rectangle at top
      doc.fillColor(colors.black).rect(0, 0, pageWidth, 90).fill();

      // Text in header
      doc.fontSize(24).font('Helvetica-Bold').fillColor(colors.white);
      doc.text('FICHA', margin, 15, { width: 200 });
      doc.text('PRODUCTO', margin, 42, { width: 200 });

      // House icon + circle on right
      const iconX = pageWidth - 120;
      drawHouseIcon(iconX, 25, 25);
      drawCircle(iconX + 35, 50, 8);

      yPos = 110;

      // === PRICE & AGENT ROW ===
      const priceX = margin;
      const agentX = pageWidth / 2 + 20;

      doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.red);
      doc.text('Price:', priceX, yPos);
      doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.red);
      doc.text('Agent:', agentX, yPos);

      yPos += 25;

      // Values with underlines
      const priceValue = data.ficha?.price ? Number(data.ficha.price).toLocaleString('es-ES') + ' €' : '';
      const agentValue = data.agentName || '';

      doc.fontSize(11).font('Helvetica').fillColor(colors.black);
      doc.text(priceValue, priceX, yPos - 5);
      drawUnderline(priceX, yPos - 5, 120);

      doc.fontSize(11).font('Helvetica').fillColor(colors.black);
      doc.text(agentValue, agentX, yPos - 5);
      drawUnderline(agentX, yPos - 5, 120);

      yPos += 30;

      // === INFO ROWS ===
      const col1X = margin;
      const col2X = pageWidth / 2 + 20;
      const labelColWidth = 80;
      const valueColWidth = 120;

      // Row 1: Address | City
      doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Address:', col1X, yPos);
      doc.text('City:', col2X, yPos);

      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor(colors.black);
      const addressValue = data.ficha?.address || '';
      const cityValue = data.ficha?.city || '';
      doc.text(addressValue, col1X, yPos);
      drawUnderline(col1X, yPos, valueColWidth, 18);

      doc.text(cityValue, col2X, yPos);
      drawUnderline(col2X, yPos, valueColWidth, 18);

      yPos += 28;

      // Row 2: Owner | Phone/Email
      doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Owner:', col1X, yPos);
      doc.text('Phone/Email:', col2X, yPos);

      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor(colors.black);
      const ownerValue = data.ficha?.owner || '';
      const phoneValue = data.ficha?.phone || '';
      doc.text(ownerValue, col1X, yPos);
      drawUnderline(col1X, yPos, valueColWidth, 18);

      doc.text(phoneValue, col2X, yPos);
      drawUnderline(col2X, yPos, valueColWidth, 18);

      yPos += 28;

      // Row 3: Type of Property | Date
      doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Type of Property:', col1X, yPos);
      doc.text('Date:', col2X, yPos);

      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor(colors.black);
      const propTypeValue = data.ficha?.propertyType || '';
      const dateValue = data.ficha?.date ? new Date(data.ficha.date + 'T12:00:00').toLocaleDateString('es-ES') : '';
      doc.text(propTypeValue, col1X, yPos);
      drawUnderline(col1X, yPos, valueColWidth, 18);

      doc.text(dateValue, col2X, yPos);
      drawUnderline(col2X, yPos, valueColWidth, 18);

      yPos += 35;

      // === COSTS SECTION ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Costs:', margin, yPos);
      yPos += 20;

      // Draw costs table with red borders
      const costRowHeight = 28;
      const costTableLeft = margin;
      const costTableWidth = contentWidth;

      const costItems = [
        { label: 'IBI / year', value: data.ficha?.ibi ? Number(data.ficha.ibi).toLocaleString('es-ES') + ' €' : '' },
        { label: 'Community / month', value: data.ficha?.community ? Number(data.ficha.community).toLocaleString('es-ES') + ' €' : '' },
        { label: 'Garbage / year', value: data.ficha?.garbage ? Number(data.ficha.garbage).toLocaleString('es-ES') + ' €' : '' },
        { label: 'Water Bill / month', value: data.ficha?.water ? Number(data.ficha.water).toLocaleString('es-ES') + ' €' : '' },
        { label: 'Electricity Bill / month', value: data.ficha?.electricity ? Number(data.ficha.electricity).toLocaleString('es-ES') + ' €' : '' },
      ];

      costItems.forEach((item, idx) => {
        const cellY = yPos + idx * costRowHeight;
        // Draw red border
        doc.strokeColor(colors.red).lineWidth(1.5);
        doc.rect(costTableLeft, cellY, costTableWidth, costRowHeight).stroke();

        // Add text
        doc.fontSize(9).font('Helvetica').fillColor(colors.black);
        doc.text(item.label, costTableLeft + 10, cellY + 7, { width: contentWidth - 20 });
        doc.text(item.value, costTableLeft + 10, cellY + 18, { width: contentWidth - 20 });
      });

      yPos += costItems.length * costRowHeight + 15;

      // === DETAILS SECTION ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Details:', margin, yPos);
      yPos += 20;

      // Two-column details table
      const detailRowHeight = 35;
      const col1LeftX = margin;
      const col1Width = (contentWidth - 10) / 2;
      const col2LeftX = margin + col1Width + 10;
      const col2Width = (contentWidth - 10) / 2;

      const detailsData = [
        { left: { label: 'Plot m2', value: data.ficha?.plotM2 || '' }, right: { label: 'Bedrooms', value: data.ficha?.bedrooms || '' } },
        { left: { label: 'Surface Built m2', value: data.ficha?.surfaceBuilt || '' }, right: { label: 'Bathrooms', value: data.ficha?.bathrooms || '' } },
        { left: { label: 'Built Year', value: data.ficha?.builtYear || '' }, right: { label: 'Toilets', value: data.ficha?.toilets || '' } },
        { left: { label: 'Orientation', value: data.ficha?.orientation || '' }, right: { label: 'Heating', value: data.ficha?.heating || '' } },
        { left: { label: 'Floors', value: data.ficha?.floors || '' }, right: { label: 'Parkings', value: data.ficha?.parkings || '' } },
        { left: { label: 'Time on the Market', value: data.ficha?.timeOnMarket || '' }, right: { label: 'Refurbished Year', value: data.ficha?.refurbishedYear || '' } },
      ];

      detailsData.forEach((row, idx) => {
        const cellY = yPos + idx * detailRowHeight;
        // Left cell
        doc.strokeColor(colors.red).lineWidth(1.5);
        doc.rect(col1LeftX, cellY, col1Width, detailRowHeight).stroke();
        doc.fontSize(9).font('Helvetica').fillColor(colors.black);
        doc.text(row.left.label + ': ' + row.left.value, col1LeftX + 8, cellY + 12, { width: col1Width - 16 });

        // Right cell
        doc.strokeColor(colors.red).lineWidth(1.5);
        doc.rect(col2LeftX, cellY, col2Width, detailRowHeight).stroke();
        doc.fontSize(9).font('Helvetica').fillColor(colors.black);
        doc.text(row.right.label + ': ' + row.right.value, col2LeftX + 8, cellY + 12, { width: col2Width - 16 });
      });

      yPos += detailsData.length * detailRowHeight + 15;

      // === PAGE 2: FEATURES TABLE ===
      doc.addPage();
      yPos = margin;

      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Features:', margin, yPos);
      yPos += 20;

      // Two-column features table with checkboxes
      const featureRowHeight = 30;
      const featureCol1Width = (contentWidth - 10) / 2;
      const featureCol2Width = (contentWidth - 10) / 2;
      const featureCol1X = margin;
      const featureCol2X = margin + featureCol1Width + 10;

      const featuresData = [
        {
          label: 'Upload on the WEB',
          selected: data.ficha?.uploadWeb?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.uploadWeb || ''
        },
        {
          label: 'Upload on IDEALISTA',
          selected: data.ficha?.uploadIdealista?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.uploadIdealista || ''
        },
        {
          label: 'Underground',
          selected: data.ficha?.underground?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.underground || ''
        },
        {
          label: 'Views',
          options: ['Sea', 'Mountain', 'None'],
          current: data.ficha?.views || ''
        },
        {
          label: 'Covered Garage',
          selected: data.ficha?.coveredGarage?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.coveredGarage || ''
        },
        {
          label: 'Guest Apartment',
          selected: data.ficha?.guestApartment?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.guestApartment || ''
        },
        {
          label: 'Air Conditioning',
          options: ['Nuevos', 'Viejos', 'No'],
          current: data.ficha?.airConditioning || ''
        },
        {
          label: 'Swimming Pool',
          options: ['Yes', 'No', 'Community'],
          current: data.ficha?.swimmingPool || ''
        },
        {
          label: 'Furniture Included',
          selected: data.ficha?.furnitureIncluded?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.furnitureIncluded || ''
        },
        {
          label: 'Lift',
          selected: data.ficha?.lift?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.lift || ''
        },
        {
          label: 'Garden',
          selected: data.ficha?.garden?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.garden || ''
        },
        {
          label: 'Tourist Licence',
          selected: data.ficha?.touristLicence?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.touristLicence || ''
        },
        {
          label: 'CBI Sign outside',
          selected: data.ficha?.cbiSign?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.cbiSign || ''
        },
        {
          label: 'Do we have keys',
          selected: data.ficha?.haveKeys?.toLowerCase() === 'yes',
          options: ['Yes', 'No'],
          current: data.ficha?.haveKeys || ''
        },
      ];

      // Arrange features in two columns
      const half = Math.ceil(featuresData.length / 2);
      for (let i = 0; i < half; i++) {
        const cellY = yPos + i * featureRowHeight;

        // Left feature
        if (featuresData[i]) {
          const feat = featuresData[i];
          doc.strokeColor(colors.red).lineWidth(1);
          doc.rect(featureCol1X, cellY, featureCol1Width, featureRowHeight).stroke();

          doc.fontSize(9).font('Helvetica').fillColor(colors.black);
          doc.text(feat.label, featureCol1X + 8, cellY + 5, { width: featureCol1Width - 70 });

          // Draw checkboxes for options
          let boxX = featureCol1X + featureCol1Width - 60;
          feat.options.forEach((option) => {
            const isSelected = feat.current?.toLowerCase() === option.toLowerCase();
            const checkbox = isSelected ? '☑' : '☐';
            doc.fontSize(8).font('Helvetica').fillColor(colors.black);
            doc.text(checkbox + ' ' + option, boxX, cellY + 18, { width: 50 });
            boxX += 50;
          });
        }

        // Right feature
        if (featuresData[half + i]) {
          const feat = featuresData[half + i];
          doc.strokeColor(colors.red).lineWidth(1);
          doc.rect(featureCol2X, cellY, featureCol2Width, featureRowHeight).stroke();

          doc.fontSize(9).font('Helvetica').fillColor(colors.black);
          doc.text(feat.label, featureCol2X + 8, cellY + 5, { width: featureCol2Width - 70 });

          // Draw checkboxes for options
          let boxX = featureCol2X + featureCol2Width - 60;
          feat.options.forEach((option) => {
            const isSelected = feat.current?.toLowerCase() === option.toLowerCase();
            const checkbox = isSelected ? '☑' : '☐';
            doc.fontSize(8).font('Helvetica').fillColor(colors.black);
            doc.text(checkbox + ' ' + option, boxX, cellY + 18, { width: 50 });
            boxX += 50;
          });
        }
      }

      yPos += half * featureRowHeight + 15;

      // === REQUESTED DOCUMENTS ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.black);
      doc.text('Requested Documents:', margin, yPos);
      yPos += 20;

      const docRowHeight = 30;
      const docs = [
        { label: 'NIEs', checked: data.ficha?.nies },
        { label: 'DNI/Passports', checked: data.ficha?.dniPassports },
        { label: 'Escritura (Purchase Deed)', checked: data.ficha?.escritura },
        { label: 'Floor Plans', checked: data.ficha?.floorPlans },
        { label: 'CEE (Energy C.)', checked: data.ficha?.cee },
      ];

      docs.forEach((doc_item, idx) => {
        const cellY = yPos + idx * docRowHeight;
        doc.strokeColor(colors.red).lineWidth(1);
        doc.rect(margin, cellY, contentWidth, docRowHeight).stroke();

        const checkbox = doc_item.checked ? '☑' : '☐';
        doc.fontSize(10).font('Helvetica').fillColor(colors.black);
        doc.text(checkbox + ' ' + doc_item.label, margin + 10, cellY + 8);
      });

      yPos += docs.length * docRowHeight + 15;

      // === EXTRA COMMENTS ===
      if (data.ficha?.extraComments?.trim()) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.black);
        doc.text('Extra Comments:', margin, yPos);
        yPos += 20;

        doc.fontSize(10).font('Helvetica').fillColor(colors.black);
        doc.text(data.ficha.extraComments, margin, yPos, { width: contentWidth });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
