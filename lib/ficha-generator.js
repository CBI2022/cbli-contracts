import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateFicha(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const RED = '#CC3333';
      const BLACK = '#000000';
      const WHITE = '#FFFFFF';
      const pageWidth = doc.page.width;
      const margin = 50;
      const W = pageWidth - margin * 2;
      const f = data.ficha || {};
      let y = margin;

      const val = (v) => v || '—';
      const fmtNum = (v) => v ? Number(v).toLocaleString('es-ES') + ' €' : '—';
      const fmtDate = (v) => {
        if (!v) return '—';
        try { return new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return v; }
      };

      const checkPage = (need) => {
        if (y + need > doc.page.height - margin) { doc.addPage(); y = margin; }
      };

      // === HEADER with CBLI logo ===
      const headerHeight = 100;
      doc.fillColor(BLACK).rect(0, 0, pageWidth, headerHeight).fill();

      // Load and place logo centered in header
      try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        const logoBuffer = fs.readFileSync(logoPath);
        const logoW = 280;
        const logoH = logoW * (1080 / 1920);
        const logoX = (pageWidth - logoW) / 2;
        const logoY = (headerHeight - logoH) / 2;
        doc.image(logoBuffer, logoX, logoY, { width: logoW });
      } catch (e) {
        doc.fontSize(20).font('Helvetica-Bold').fillColor(WHITE);
        doc.text('COSTA BLANCA INVESTMENTS', 0, 35, { width: pageWidth, align: 'center' });
      }

      y = headerHeight + 15;

      // === PAGE 1 TOP SECTION ===
      // 1. Price | Agent
      const midX = pageWidth / 2 + 20;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
      doc.text('Price:', margin, y);
      doc.text('Agent:', midX, y);
      y += 16;
      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      doc.text(fmtNum(f.price), margin, y);
      doc.text(val(data.agentName), midX, y);
      y += 20;

      // 2. Commission % | City
      doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
      doc.text('Commission %:', margin, y);
      doc.text('City:', midX, y);
      y += 16;
      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      const commRate = f.commissionRate || '';
      const commStr = commRate ? commRate + (f.ivaIncluded === true || f.ivaIncluded === 'true' ? ' (IVA incl.)' : '') : '—';
      doc.text(commStr, margin, y);
      doc.text(val(f.city), midX, y);
      y += 20;

      // 3. Street and N° | Phone
      doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
      doc.text('Street and N°:', margin, y);
      doc.text('Phone:', midX, y);
      y += 16;
      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      doc.text(val(f.address), margin, y, { width: midX - margin - 10 });
      doc.text(val(f.phone), midX, y);
      y += 20;

      // 4. Owner Full name | Email
      doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
      doc.text('Owner Full name:', margin, y);
      doc.text('Email:', midX, y);
      y += 16;
      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      doc.text(val(f.owner), margin, y);
      doc.text('—', midX, y);
      y += 20;

      // 5. Date | Contract Signed
      doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
      doc.text('Date:', margin, y);
      doc.text('Contract Signed:', midX, y);
      y += 16;
      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      doc.text(fmtDate(data.date), margin, y);
      doc.text(val(f.contractSigned), midX, y);
      y += 20;

      // 6. New Build YES/NO | Completion Date
      doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
      doc.text('New Build:', margin, y);
      doc.text('Completion Date:', midX, y);
      y += 16;
      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      doc.text(val(f.newBuilt), margin, y);
      const completionDate = f.newBuilt === 'Yes' ? val((f.newBuiltEndMonth || '') + ' ' + (f.newBuiltEndYear || '')) : '—';
      doc.text(completionDate, midX, y);
      y += 25;

      // === COSTS TABLE ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Costs:', margin, y);
      y += 12;

      const costsData = [
        ['IBI / year', fmtNum(f.ibi)],
        ['Community / Year', fmtNum(f.community)],
        ['Basura / Year', fmtNum(f.garbage)],
        ['Utilities / month', fmtNum(f.utilities)],
      ];

      const costRowHeight = 24;
      costsData.forEach(([label, value]) => {
        checkPage(costRowHeight + 5);
        doc.strokeColor(RED).lineWidth(1.5).rect(margin, y, W, costRowHeight).stroke();
        doc.fontSize(9).font('Helvetica').fillColor(BLACK);
        doc.text(label, margin + 10, y + 7, { width: W * 0.5 });
        doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(value, margin + W * 0.5 + 10, y + 7, { width: W * 0.4, align: 'right' });
        y += costRowHeight;
      });
      y += 15;

      // === INFORMATION TABLE (2 columns, red borders) ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Information:', margin, y);
      y += 12;

      const colW = (W - 15) / 2;
      const col2X = margin + colW + 15;
      const rowHeight = 24;

      const infoRows = [
        ['Property Type', val(f.propertyType), 'Building year', val(f.builtYear)],
        ['Views', val(f.views), 'Refurbished in', val(f.refurbishedYear)],
        ['m2 Plot', val(f.plotM2), 'Heating', val(f.heating)],
        ['m2 Built', val(f.surfaceBuilt), 'Pool', val(f.swimmingPool)],
        ['m2 Useful', val(f.m2Useful), 'Aircon', val(f.airConditioning)],
        ['Bedrooms', val(f.bedrooms), 'Garage/Parking', val(f.parkings)],
        ['Bathrooms', val(f.bathrooms), 'Furnished', val(f.furnitureIncluded)],
        ['Guest Toilet', val(f.guestToilet), 'Storage Room', val(f.storageRoom)],
        ['Kitchen', val(f.kitchen), '', ''],
      ];

      infoRows.forEach(([l1, v1, l2, v2]) => {
        checkPage(rowHeight + 5);
        doc.strokeColor(RED).lineWidth(1.5);
        doc.rect(margin, y, colW, rowHeight).stroke();
        doc.rect(col2X, y, colW, rowHeight).stroke();
        doc.fontSize(8).font('Helvetica').fillColor(BLACK);
        doc.text(l1 + ':', margin + 8, y + 4, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(v1, margin + 8, y + 12, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica').fillColor(BLACK);
        doc.text(l2 + ':', col2X + 8, y + 4, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(v2, col2X + 8, y + 12, { width: colW - 16 });
        y += rowHeight;
      });

      // === PAGE 2 ===
      doc.addPage();
      y = margin;

      // === FEATURES TABLE (Page 2) ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Features:', margin, y);
      y += 12;

      const featuresRows = [
        ['BBQ', val(f.bbq), 'Jacuzzi', val(f.jacuzzi)],
        ['Lift', val(f.lift), 'Orientation', val(f.orientation)],
        ['Summer Kitchen', val(f.summerKitchen), 'Floors total', val(f.floors)],
        ['Laundry Room', val(f.laundryRoom), 'Floors N° (Apartment)', val(f.aptFloor || 'N/A')],
        ['Outdoor shower', val(f.outdoorShower), 'Garden', val(f.garden)],
      ];

      featuresRows.forEach(([l1, v1, l2, v2]) => {
        checkPage(rowHeight + 5);
        doc.strokeColor(RED).lineWidth(1.5);
        doc.rect(margin, y, colW, rowHeight).stroke();
        doc.rect(col2X, y, colW, rowHeight).stroke();
        doc.fontSize(8).font('Helvetica').fillColor(BLACK);
        doc.text(l1 + ':', margin + 8, y + 4, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(v1, margin + 8, y + 12, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica').fillColor(BLACK);
        doc.text(l2 + ':', col2X + 8, y + 4, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(v2, col2X + 8, y + 12, { width: colW - 16 });
        y += rowHeight;
      });

      y += 15;

      // === GUEST APARTMENT SECTION ===
      if (f.guestApartment === 'Yes') {
        checkPage(rowHeight * 3 + 20);
        doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
        doc.text('Guest Apartment:', margin, y);
        y += 12;

        const guestRows = [
          ['Guest Bedrooms', val(f.guestBedrooms), 'Guest Lounge', val(f.guestLounge)],
          ['Guest Bathroom', val(f.guestBathroom), 'Guest Dining Room', val(f.guestDinningRoom)],
          ['Guest Toilet', val(f.guestToilet), 'Guest Kitchen', val(f.guestKitchen)],
        ];

        guestRows.forEach(([l1, v1, l2, v2]) => {
          checkPage(rowHeight + 5);
          doc.strokeColor(RED).lineWidth(1.5);
          doc.rect(margin, y, colW, rowHeight).stroke();
          doc.rect(col2X, y, colW, rowHeight).stroke();
          doc.fontSize(8).font('Helvetica').fillColor(BLACK);
          doc.text(l1 + ':', margin + 8, y + 4, { width: colW - 16 });
          doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
          doc.text(v1, margin + 8, y + 12, { width: colW - 16 });
          doc.fontSize(8).font('Helvetica').fillColor(BLACK);
          doc.text(l2 + ':', col2X + 8, y + 4, { width: colW - 16 });
          doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
          doc.text(v2, col2X + 8, y + 12, { width: colW - 16 });
          y += rowHeight;
        });
        y += 15;
      }

      // === EXTRA INFO TABLE ===
      checkPage(rowHeight * 3 + 20);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Extra Info:', margin, y);
      y += 12;

      const extraRows = [
        ['Upload On web', val(f.uploadWeb), 'CBI Sign Outside', val(f.cbiSign)],
        ['Idealista', val(f.uploadIdealista), 'Keys', val(f.haveKeys)],
        ['Tourist License', val(f.touristLicence), 'Key Holder Number', val(f.keyholderPhone || '—')],
      ];

      extraRows.forEach(([l1, v1, l2, v2]) => {
        checkPage(rowHeight + 5);
        doc.strokeColor(RED).lineWidth(1.5);
        doc.rect(margin, y, colW, rowHeight).stroke();
        doc.rect(col2X, y, colW, rowHeight).stroke();
        doc.fontSize(8).font('Helvetica').fillColor(BLACK);
        doc.text(l1 + ':', margin + 8, y + 4, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(v1, margin + 8, y + 12, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica').fillColor(BLACK);
        doc.text(l2 + ':', col2X + 8, y + 4, { width: colW - 16 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(v2, col2X + 8, y + 12, { width: colW - 16 });
        y += rowHeight;
      });

      y += 15;

      // === NECESSARY DOCUMENTS ===
      checkPage(rowHeight * 3 + 20);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Necessary Documents:', margin, y);
      y += 12;

      const docsData = [
        ['Floor Plans', f.docFloorPlans ? '✓' : ''],
        ['NIE/DNI/PASSPORTS', f.docNieDni ? '✓' : ''],
        ['CEE (Energy C.)', val(f.ceeRating)],
      ];

      docsData.forEach(([label, value]) => {
        checkPage(rowHeight + 5);
        doc.strokeColor(RED).lineWidth(1.5).rect(margin, y, W, rowHeight).stroke();
        doc.fontSize(9).font('Helvetica').fillColor(BLACK);
        doc.text(label + ':', margin + 10, y + 7, { width: W * 0.5 });
        doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(value, margin + W * 0.5 + 10, y + 7, { width: W * 0.4, align: 'right' });
        y += rowHeight;
      });

      y += 15;

      // === PROPERTY DESCRIPTION ===
      checkPage(60);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Extra Comments / Property Description:', margin, y);
      y += 12;

      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      const desc = f.description?.trim() || '—';
      doc.text(desc, margin, y, { width: W, lineGap: 4 });

      // Footer
      y = doc.page.height - 30;
      doc.fontSize(8).font('Helvetica').fillColor('#888888');
      doc.text('Generated by CBLI Property System — costablancainvestments.com', margin, y, { width: W, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
