import PDFDocument from 'pdfkit';

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

      // === HEADER ===
      doc.fillColor(BLACK).rect(0, 0, pageWidth, 90).fill();
      doc.fontSize(24).font('Helvetica-Bold').fillColor(WHITE);
      doc.text('FICHA', margin, 15, { width: 200 });
      doc.text('PRODUCTO', margin, 42, { width: 200 });
      // House icon
      const ix = pageWidth - 100;
      doc.strokeColor(WHITE).lineWidth(2);
      doc.moveTo(ix, 55).lineTo(ix + 15, 30).lineTo(ix + 30, 55).stroke();
      doc.rect(ix + 3, 55, 24, 18).stroke();
      y = 110;

      // === PRICE & AGENT ROW ===
      const midX = pageWidth / 2 + 20;
      doc.fontSize(16).font('Helvetica-Bold').fillColor(RED);
      doc.text('Price:', margin, y);
      doc.text('Agent:', midX, y);
      y += 22;
      doc.fontSize(11).font('Helvetica').fillColor(BLACK);
      doc.text(fmtNum(f.price), margin + 50, y);
      doc.text(val(data.agentName), midX + 55, y);
      y += 25;

      // === INFO ROWS ===
      const infoRow = (l1, v1, l2, v2) => {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(BLACK);
        doc.text(l1, margin, y); doc.text(l2, midX, y);
        y += 16;
        doc.fontSize(10).font('Helvetica').fillColor(BLACK);
        doc.text(v1, margin, y); doc.text(v2, midX, y);
        doc.strokeColor(BLACK).lineWidth(0.5);
        doc.moveTo(margin, y + 14).lineTo(midX - 30, y + 14).stroke();
        doc.moveTo(midX, y + 14).lineTo(pageWidth - margin, y + 14).stroke();
        y += 25;
      };

      infoRow('Address:', val(f.address), 'City:', val(f.city));
      infoRow('Owner:', val(f.owner), 'Phone/Email:', val(f.phone));
      infoRow('Type of Property:', val(f.propertyType), 'Date:', fmtDate(data.date));

      // Commission Rate
      if (f.commissionRate) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(RED);
        doc.text('Commission Rate:', margin, y);
        doc.fontSize(11).font('Helvetica').fillColor(BLACK);
        doc.text(f.commissionRate + (f.ivaIncluded ? ' IVA Included' : ' IVA not Included'), margin + 120, y);
        y += 25;
      }

      // === COSTS ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Costs:', margin, y);
      y += 18;

      const costItems = [
        ['IBI / year', fmtNum(f.ibi)],
        ['Community / month', fmtNum(f.community)],
        ['Garbage / year', fmtNum(f.garbage)],
      ];
      const rh = 26;
      costItems.forEach(([label, value]) => {
        doc.strokeColor(RED).lineWidth(1.5).rect(margin, y, W, rh).stroke();
        doc.fontSize(9).font('Helvetica-Oblique').fillColor(BLACK);
        doc.text(label + ':  ' + value, margin + 10, y + 8, { width: W - 20 });
        y += rh;
      });
      y += 12;

      // === DETAILS ===
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Details:', margin, y);
      y += 18;

      const colW = (W - 10) / 2;
      const col2X = margin + colW + 10;
      const drh = 30;

      const detailRows = [
        ['Plot m2', val(f.plotM2), 'Bedrooms', val(f.bedrooms)],
        ['Surface Built m2', val(f.surfaceBuilt), 'Bathrooms', val(f.bathrooms)],
        ['Built Year', val(f.builtYear), 'Toilets', val(f.toilets)],
        ['Orientation', val(f.orientation), 'Heating', val(f.heating)],
        ['Floors', val(f.floors), 'Parkings', val(f.parkings)],
        ['Time on Market', val(f.timeOnMarket), 'Refurbished Year', val(f.refurbishedYear)],
        ['Apartment Floor', val(f.aptFloor || 'N/A'), 'Building Total Floors', val(f.buildingFloors || 'N/A')],
        ['New Built', val(f.newBuilt), f.newBuilt === 'Yes' ? 'Construction End' : '', f.newBuilt === 'Yes' ? val((f.newBuiltEndMonth || '') + ' ' + (f.newBuiltEndYear || '')) : ''],
      ];

      detailRows.forEach(([l1, v1, l2, v2]) => {
        checkPage(drh + 5);
        doc.strokeColor(RED).lineWidth(1.5);
        doc.rect(margin, y, colW, drh).stroke();
        if (l2) doc.rect(col2X, y, colW, drh).stroke();
        doc.fontSize(9).font('Helvetica-Oblique').fillColor(BLACK);
        doc.text(l1 + ': ' + v1, margin + 8, y + 10, { width: colW - 16 });
        if (l2) doc.text(l2 + ': ' + v2, col2X + 8, y + 10, { width: colW - 16 });
        y += drh;
      });
      y += 12;

      // === FEATURES (page 2) ===
      doc.addPage();
      y = margin;

      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Features:', margin, y);
      y += 18;

      const feats = [
        ['Upload on WEB', val(f.uploadWeb)],
        ['Upload on IDEALISTA', val(f.uploadIdealista)],
        ['Underground', val(f.underground)],
        ['Views', val(f.views)],
        ['Covered Garage', val(f.coveredGarage)],
        ['Guest Apartment', val(f.guestApartment)],
        ['Air Conditioning', val(f.airConditioning)],
        ['Swimming Pool', val(f.swimmingPool)],
        ['Furniture Included', val(f.furnitureIncluded)],
        ['Lift', val(f.lift)],
        ['Garden', val(f.garden)],
        ['Tourist Licence', val(f.touristLicence)],
        ['CBI Sign outside', val(f.cbiSign)],
        ['Do we have keys', val(f.haveKeys)],
        ['BBQ', val(f.bbq)],
        ['Storage Room', val(f.storageRoom)],
        ['Summer Kitchen', val(f.summerKitchen)],
        ['Laundry Room', val(f.laundryRoom)],
        ['Outdoor Shower', val(f.outdoorShower)],
        ['Jacuzzi', val(f.jacuzzi)],
        ['Fireplace', val(f.fireplace)],
        ['CEE (Energy Certificate)', val(f.ceeRating)],
      ];

      const frh = 28;
      const half = Math.ceil(feats.length / 2);
      for (let i = 0; i < half; i++) {
        checkPage(frh + 5);
        // Left
        if (feats[i]) {
          doc.strokeColor(RED).lineWidth(1).rect(margin, y, colW, frh).stroke();
          doc.fontSize(9).font('Helvetica').fillColor(BLACK);
          doc.text(feats[i][0], margin + 8, y + 5, { width: colW * 0.55 });
          doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK);
          doc.text(feats[i][1], margin + colW * 0.6, y + 5, { width: colW * 0.35, align: 'right' });
        }
        // Right
        if (feats[half + i]) {
          doc.strokeColor(RED).lineWidth(1).rect(col2X, y, colW, frh).stroke();
          doc.fontSize(9).font('Helvetica').fillColor(BLACK);
          doc.text(feats[half + i][0], col2X + 8, y + 5, { width: colW * 0.55 });
          doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK);
          doc.text(feats[half + i][1], col2X + colW * 0.6, y + 5, { width: colW * 0.35, align: 'right' });
        }
        y += frh;
      }

      // Keyholder info
      if (f.haveKeys === 'Keyholder' && f.keyholderName) {
        y += 5;
        doc.fontSize(9).font('Helvetica-Oblique').fillColor(BLACK);
        doc.text('Keyholder: ' + f.keyholderName + (f.keyholderPhone ? ' — ' + f.keyholderPhone : ''), margin, y);
        y += 15;
      }

      y += 15;

      // === PROPERTY DESCRIPTION ===
      checkPage(60);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(BLACK);
      doc.text('Property Description:', margin, y);
      y += 18;

      doc.fontSize(10).font('Helvetica').fillColor(BLACK);
      const desc = f.description?.trim() || f.extraComments?.trim() || '—';
      doc.text(desc, margin, y, { width: W, lineGap: 4 });

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#888888');
      doc.text('Generated by CBLI Property System — costablancainvestments.com', margin, doc.page.height - 30, { width: W, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
