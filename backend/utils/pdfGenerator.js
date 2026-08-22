const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FOOTER_DISCLAIMER =
  'This Agreement has been electronically generated through the AgreeKaro\u2122 platform. ' +
  'AgreeKaro acts solely as an independent technology platform for the creation, management, ' +
  'electronic acceptance, verification, secure storage, and audit trail of digital agreements. ' +
  'AgreeKaro is not a contracting party to this Agreement and does not provide legal representation, ' +
  'payment processing, escrow services, or financial intermediation, nor does it collect, receive, hold, ' +
  'transfer, process, or guarantee payments between the Parties. Any Platform Service Fee paid to AgreeKaro ' +
  'is solely for access to and use of the platform and its related services and is entirely independent of the ' +
  'commercial consideration, project value, or financial obligations agreed between Party A and Party B. ' +
  'All contractual rights, obligations, liabilities, and commercial commitments arising under this Agreement ' +
  'remain solely between the Parties.';

const PAGE_HEIGHT = 841.89;
const MARGIN = { top: 60, bottom: 125, left: 50, right: 50 };
const CONTENT_WIDTH = 595.28 - MARGIN.left - MARGIN.right;
const CONTENT_BOTTOM = PAGE_HEIGHT - MARGIN.bottom;
const HEADER_Y = 32;
const FOOTER_Y = 726;

const ACCENT = '#2563eb';
const NAVY = '#1e3a8a';
const NAVY_DARK = '#1e40af';
const GREEN = '#16a34a';
const AMBER = '#d97706';
const INK = '#111827';
const BODY = '#1f2937';
const MUTED = '#6b7280';
const LIGHT = '#eff6ff';
const LIGHT_BORDER = '#bfdbfe';
const LINE = '#e5e7eb';

const FONT_FILES = {
  regular: path.join(__dirname, '..', 'fonts', 'SourceSerif4-Regular.ttf'),
  bold: path.join(__dirname, '..', 'fonts', 'SourceSerif4-SemiBold.ttf'),
  semibold: path.join(__dirname, '..', 'fonts', 'SourceSerif4-SemiBold.ttf'),
  heading: path.join(__dirname, '..', 'fonts', 'SourceSerif4-Bold.ttf'),
  head: path.join(__dirname, '..', 'fonts', 'Comfortaa-Bold.woff'),
  headMedium: path.join(__dirname, '..', 'fonts', 'Comfortaa-Medium.woff')
};

const fmtMoney = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return 'Rs. ' + num.toLocaleString('en-IN');
};

const fmtDate = (value) => {
  if (!value) return 'N/A';
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return 'N/A';
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fmtDateTime = (value) => {
  if (!value) return '-';
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return '-';
  return dt.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const fmtTimeline = (value) => {
  if (!value) return 'N/A';
  const str = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const dt = new Date(str + 'T00:00:00');
  if (isNaN(dt.getTime())) return str;
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const pctOf = (part, total) => {
  const p = Number(part);
  if (total > 0 && !isNaN(p)) return Math.round((p / total) * 100) + '%';
  return '\u2014';
};

const PDF_VERSION = 4;

const generatePDF = async (agreement) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'agreements');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `agreement_${agreement._id}_v${PDF_VERSION}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { ...MARGIN }
    });

    const canEmbedFonts =
      FONT_FILES.regular && FONT_FILES.bold && FONT_FILES.head && FONT_FILES.heading &&
      fs.existsSync(FONT_FILES.regular) && fs.existsSync(FONT_FILES.bold) &&
      fs.existsSync(FONT_FILES.head) && fs.existsSync(FONT_FILES.heading);
    let F = {
      regular: 'Helvetica', bold: 'Helvetica-Bold', semibold: 'Helvetica-Bold',
      heading: 'Helvetica-Bold', head: 'Helvetica-Bold', headMedium: 'Helvetica-Bold'
    };
    if (canEmbedFonts) {
      doc.registerFont('SourceSerif4', FONT_FILES.regular);
      doc.registerFont('SourceSerif4-SemiBold', FONT_FILES.bold);
      doc.registerFont('SourceSerif4-Bold', FONT_FILES.heading);
      doc.registerFont('Comfortaa', FONT_FILES.headMedium);
      doc.registerFont('Comfortaa-Bold', FONT_FILES.head);
      F = {
        regular: 'SourceSerif4',
        bold: 'SourceSerif4-SemiBold',
        semibold: 'SourceSerif4-SemiBold',
        heading: 'SourceSerif4-Bold',
        head: 'Comfortaa-Bold',
        headMedium: 'Comfortaa-Medium'
      };
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    let pageNum = 0;
    const decorate = () => {
      pageNum++;
      doc.rect(0, 0, 6, PAGE_HEIGHT).fill(NAVY);
      doc.roundedRect(MARGIN.left, 27, 13, 13, 3.5).fill(ACCENT);
      doc.fillColor('#ffffff').font(F.bold).fontSize(7)
        .text('AK', MARGIN.left, 29, { width: 13, align: 'center', lineBreak: false });
      doc.fillColor(NAVY).font(F.head).fontSize(11)
        .text('AgreeKaro', MARGIN.left + 18, 28, { lineBreak: false });
      doc.fillColor(MUTED).font(F.regular).fontSize(8.5)
        .text(`P a g e | ${pageNum}`, MARGIN.left, HEADER_Y, { width: CONTENT_WIDTH, align: 'right', lineBreak: false });
      doc.moveTo(MARGIN.left, 47).lineTo(MARGIN.left + CONTENT_WIDTH, 47).lineWidth(0.8).strokeColor(LINE).stroke();

      const realBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 5;
      doc.moveTo(MARGIN.left, 718).lineTo(MARGIN.left + CONTENT_WIDTH, 718).lineWidth(0.5).strokeColor(LINE).stroke();
      doc.font(F.regular).fontSize(6.7).fillColor(MUTED)
        .text(FOOTER_DISCLAIMER, MARGIN.left, FOOTER_Y, { width: CONTENT_WIDTH, lineGap: 1.5 })
        .text(`\u00A9 ${new Date().getFullYear()} AgreeKaro. All Rights Reserved.`, MARGIN.left, undefined, { width: CONTENT_WIDTH, align: 'center' });
      doc.page.margins.bottom = realBottom;
      doc.y = MARGIN.top;
    };
    doc.on('pageAdded', decorate);
    decorate();

    const ensureSpace = (height) => {
      if (doc.y + height > CONTENT_BOTTOM) {
        doc.addPage();
      }
    };

    const heading = (num, title) => {
      ensureSpace(36);
      doc.moveDown(0.6);
      const y = doc.y;
      if (num !== null) {
        const bx = MARGIN.left + 2;
        doc.fillColor(NAVY).font(F.heading).fontSize(12.5);
        const numStr = String(num) + '.';
        const numW = doc.widthOfString(numStr);
        doc.text(numStr, bx, y, { lineBreak: false });
        doc.fillColor(NAVY).font(F.heading).fontSize(12.5)
          .text(title, bx + numW + 6, y, { lineBreak: false });
        doc.y = y + 22;
      } else {
        doc.fillColor(NAVY).font(F.heading).fontSize(12.5)
          .text(title, MARGIN.left + 2, y, { lineBreak: false });
        doc.y = y + 22;
      }
      doc.moveTo(MARGIN.left + 2, doc.y).lineTo(MARGIN.left + CONTENT_WIDTH, doc.y).lineWidth(0.6).strokeColor(LINE).stroke();
      doc.moveDown(0.4);
    };

    const para = (text, opts = {}) => {
      const { font: fnt, color, ...rest } = opts;
      const fontName = fnt || F.regular;
      const options = { width: CONTENT_WIDTH, lineGap: 3, ...rest };
      doc.font(fontName).fontSize(10.2).fillColor(color || BODY);
      const height = doc.heightOfString(text, options);
      ensureSpace(height + 8);
      doc.font(fontName).fontSize(10.2).fillColor(color || BODY).text(text, MARGIN.left, doc.y, options);
      doc.moveDown(0.35);
    };

    const bullet = (text) => {
      const options = { width: CONTENT_WIDTH - 40, lineGap: 2 };
      doc.font(F.regular).fontSize(10.2).fillColor(BODY);
      const height = doc.heightOfString('\u2022  ' + text, options);
      ensureSpace(height + 4);
      doc.fillColor(ACCENT).text('\u2022  ', MARGIN.left + 14, undefined, { width: 20, lineBreak: false });
      doc.fillColor(BODY).font(F.regular).fontSize(10.2).text(text, MARGIN.left + 34, undefined, options);
      doc.moveDown(0.2);
    };

    const infoCard = (title, rows) => {
      const pad = 12;
      const labelW = 76;
      const headH = 24;
      const innerLeft = MARGIN.left + pad + 6;
      const rowHeights = rows.map((row) => {
        const value = String(row.value ?? '').trim() || 'N/A';
        doc.font(F.regular).fontSize(10);
        const vw = CONTENT_WIDTH - pad * 2 - 6 - labelW - 10;
        const h = doc.heightOfString(value, { width: vw, lineGap: 2 }) + 8;
        return Math.max(17, h);
      });
      const totalH = headH + rowHeights.reduce((a, b) => a + b, 0) + pad * 2;
      ensureSpace(totalH + 12);
      doc.moveDown(0.35);
      const y0 = doc.y;
      doc.roundedRect(MARGIN.left, y0, CONTENT_WIDTH, totalH, 8).fill(LIGHT).stroke(LIGHT_BORDER);
      doc.roundedRect(MARGIN.left, y0, 5, totalH, 2).fill(ACCENT);
      doc.fillColor(NAVY).font(F.heading).fontSize(11).text(title, innerLeft, y0 + pad);
      let cy = y0 + pad + headH;
      rows.forEach((row, ri) => {
        const value = String(row.value ?? '').trim() || 'N/A';
        if (ri > 0) {
          doc.moveTo(innerLeft, cy).lineTo(MARGIN.left + CONTENT_WIDTH - pad, cy).lineWidth(0.4).strokeColor('#dbeafe').stroke();
        }
        doc.font(F.bold).fontSize(10).fillColor('#374151');
        doc.text(row.label + ':', innerLeft, cy + 4, { width: labelW, lineBreak: false });
        doc.font(F.regular).fillColor(INK);
        doc.text(value, innerLeft + labelW, cy + 4, { width: CONTENT_WIDTH - pad * 2 - 6 - labelW - 10, lineGap: 2 });
        cy += rowHeights[ri];
      });
      doc.y = y0 + totalH + 8;
    };

    const drawTable = (headers, rows, widths, headerFill) => {
      const startX = MARGIN.left;
      const totalWidth = widths.reduce((a, b) => a + b, 0);
      const xPositions = [];
      let cx = startX;
      widths.forEach((w) => { xPositions.push(cx); cx += w; });
      const pad = 7;

      const cellLines = (text, width) => {
        doc.font(F.regular).fontSize(8.8);
        return doc.heightOfString(text || '-', { width: width - pad * 2 });
      };

      const headerHeight = Math.max(...headers.map((h, i) => cellLines(h, widths[i]))) + pad * 2;
      ensureSpace(headerHeight + 10);

      const hTop = doc.y;
      doc.roundedRect(startX, hTop, totalWidth, headerHeight, 4).fill(headerFill || ACCENT);
      doc.fillColor('#ffffff').font(F.bold).fontSize(8.8);
      headers.forEach((h, i) => {
        doc.text(h, xPositions[i] + pad, hTop + pad, { width: widths[i] - pad * 2 });
      });
      doc.y = hTop + headerHeight;

      rows.forEach((row, ri) => {
        const heights = row.map((cell, i) => cellLines(cell, widths[i]));
        const rowHeight = Math.max(...heights) + pad * 2;
        ensureSpace(rowHeight);
        const rTop = doc.y;
        if (ri % 2 === 1) {
          doc.rect(startX, rTop, totalWidth, rowHeight).fill('#f8fafc');
        }
        doc.font(F.regular).fontSize(8.8).fillColor(INK);
        row.forEach((cell, i) => {
          doc.text(cell || '-', xPositions[i] + pad, rTop + pad, { width: widths[i] - pad * 2, lineGap: 1 });
        });
        doc.y = rTop + rowHeight;
        doc.moveTo(startX, doc.y).lineTo(startX + totalWidth, doc.y).lineWidth(0.4).strokeColor(LINE).stroke();
      });

      doc.moveTo(startX, hTop).lineTo(startX, doc.y).lineWidth(0.6).strokeColor('#cbd5e1').stroke();
      doc.moveTo(startX + totalWidth, hTop).lineTo(startX + totalWidth, doc.y).lineWidth(0.6).strokeColor('#cbd5e1').stroke();
      doc.moveDown(0.5);
    };

    const a = agreement;
    const acceptedAt = a.acceptanceDetails && a.acceptanceDetails.acceptedAt;

    // ── Hero banner ──
    const heroH = 92;
    const heroY = doc.y;
    const heroGrad = doc.linearGradient(MARGIN.left, heroY, MARGIN.left + CONTENT_WIDTH, heroY);
    heroGrad.stop(0, NAVY).stop(1, NAVY_DARK);
    doc.roundedRect(MARGIN.left, heroY, CONTENT_WIDTH, heroH, 10).fill(heroGrad);
    doc.circle(MARGIN.left + CONTENT_WIDTH - 40, heroY + 12, 36).fill('#1d4ed8');
    doc.circle(MARGIN.left + CONTENT_WIDTH - 14, heroY + heroH - 16, 20).fill('#172554');

    doc.fillColor('#ffffff').font(F.heading).fontSize(20)
      .text('MUTUAL AGREEMENT', MARGIN.left, heroY + 14, { width: CONTENT_WIDTH, align: 'center' });
    doc.fillColor('#bfdbfe').font(F.regular).fontSize(9.5)
      .text('Digital service agreement executed through the AgreeKaro platform', MARGIN.left, heroY + 40, { width: CONTENT_WIDTH, align: 'center' });

    const statusTxt = a.status === 'accepted' ? 'ACCEPTED' : 'PENDING';
    const statusColor = a.status === 'accepted' ? GREEN : AMBER;
    const pillW = 78;
    const pillX = MARGIN.left + CONTENT_WIDTH - 18 - pillW;
    doc.roundedRect(pillX, heroY + 62, pillW, 18, 9).fill(statusColor);
    doc.fillColor('#ffffff').font(F.bold).fontSize(8)
      .text(statusTxt, pillX, heroY + 67, { width: pillW, align: 'center' });

    doc.font(F.bold).fontSize(7.5).fillColor('#93c5fd').text('AGREEMENT ID', MARGIN.left + 18, heroY + 62);
    doc.font(F.regular).fontSize(10).fillColor('#ffffff').text(a.agreementID || 'N/A', MARGIN.left + 18, heroY + 74);

    const dateCX = MARGIN.left + 185;
    doc.font(F.bold).fontSize(7.5).fillColor('#93c5fd')
      .text('DATE OF AGREEMENT', dateCX, heroY + 62, { width: 180, align: 'center' });
    doc.font(F.regular).fontSize(10).fillColor('#ffffff')
      .text(fmtDate(a.createdAt), dateCX, heroY + 74, { width: 180, align: 'center' });

    doc.y = heroY + heroH + 14;

    // ── Key facts strip ──
    const facts = [
      { label: 'PARTY A', value: a.freelancerName || 'Service Provider' },
      { label: 'PARTY B', value: a.clientName || 'Client' },
      { label: 'PROJECT AMOUNT', value: fmtMoney(a.price) },
      { label: 'TIMELINE', value: fmtTimeline(a.timeline) }
    ];
    const fGap = 8;
    const fw = (CONTENT_WIDTH - fGap * (facts.length - 1)) / facts.length;
    const factHeights = facts.map((f) => {
      doc.font(F.regular).fontSize(9.5);
      return doc.heightOfString(f.value, { width: fw - 20, lineGap: 1 });
    });
    const fh = Math.max(50, 28 + Math.max(...factHeights));
    const fy = doc.y;
    facts.forEach((f, i) => {
      const fx = MARGIN.left + i * (fw + fGap);
      doc.roundedRect(fx, fy, fw, fh, 6).fill('#f8fafc').stroke('#e5e7eb');
      doc.font(F.bold).fontSize(7).fillColor(MUTED).text(f.label, fx + 10, fy + 8);
      doc.font(F.regular).fontSize(9.5).fillColor(INK).text(f.value, fx + 10, fy + 20, { width: fw - 20, lineGap: 1 });
    });
    doc.y = fy + fh + 12;

    heading(1, 'Parties');
    para('Party A', { fontSize: 10.5, font: F.semibold, color: NAVY });
    infoCard('Party A', [
      { label: 'Name', value: a.freelancerName },
      { label: 'Email', value: a.freelancerEmail },
      { label: 'Mobile', value: a.freelancerPhone },
      { label: 'Address', value: a.freelancerAddress }
    ]);
    para('Party B', { fontSize: 10.5, font: F.semibold, color: NAVY });
    infoCard('Party B', [
      { label: 'Name', value: a.clientName },
      { label: 'Email', value: a.clientEmail },
      { label: 'Mobile', value: a.clientMobile },
      { label: 'Address', value: a.clientAddress }
    ]);
    para("Together referred to as the 'Parties'.");

    heading(2, 'Project Details');
    infoCard('Project Details', [
      { label: 'Project Title', value: a.title },
      { label: 'Description', value: a.description },
      { label: 'Deliverables', value: a.deliverables },
      { label: 'Timeline', value: fmtTimeline(a.timeline) },
      { label: 'Revisions Included', value: a.revisions },
      { label: 'Additional Terms', value: a.additionalTerms }
    ]);

    heading(3, 'Payment Terms');
    para('The Parties voluntarily discussed and mutually agreed to the following payment schedule:');

    const pcH = 58;
    ensureSpace(pcH + 12);
    doc.moveDown(0.35);
    const pcY = doc.y;
    doc.roundedRect(MARGIN.left, pcY, CONTENT_WIDTH, pcH, 8).fill(LIGHT).stroke(LIGHT_BORDER);
    doc.roundedRect(MARGIN.left, pcY, 5, pcH, 2).fill(NAVY);
    doc.fillColor(MUTED).font(F.bold).fontSize(8).text('TOTAL PROJECT AMOUNT', MARGIN.left + 20, pcY + 12);
    doc.fillColor(NAVY).font(F.bold).fontSize(18).text(fmtMoney(a.price), MARGIN.left + 20, pcY + 24);
    doc.fillColor(MUTED).font(F.regular).fontSize(8.5)
      .text('Amount mutually agreed between the Parties', MARGIN.left + CONTENT_WIDTH - 190, pcY + 14, { width: 170, align: 'right' });
    doc.y = pcY + pcH + 10;

    drawTable(
      ['Payment Milestone', 'Amount', 'Share of Total'],
      [
        ['Advance Payment', fmtMoney(a.advanceAmount), pctOf(a.advanceAmount, a.price)],
        ['Payment Before Delivery', fmtMoney(a.beforeDeliveryAmount), pctOf(a.beforeDeliveryAmount, a.price)],
        ['Payment After Delivery', fmtMoney(a.afterDeliveryAmount), pctOf(a.afterDeliveryAmount, a.price)]
      ],
      [260, 135, 100],
      NAVY
    );
    doc.moveDown(0.3);
    para(
      'The Parties acknowledge that the above payment schedule forms an essential part of this Agreement. ' +
      'Failure to comply with the agreed payment obligations may constitute a material breach. The ' +
      'non-breaching Party may suspend performance, withhold deliverables, terminate this Agreement where ' +
      'permitted, or pursue remedies available under applicable law.'
    );

    heading(4, 'Scope of Work');
    para(
      'Party A shall perform only the services expressly described in this Agreement. Any additional work ' +
      'requested after acceptance shall require mutual agreement and may affect pricing or timelines.'
    );

    heading(5, 'Responsibilities');
    para(
      'Party A shall perform services professionally and maintain confidentiality. Party B shall provide timely ' +
      'information, approvals and payments. Delays caused by either Party may reasonably extend timelines.'
    );

    heading(6, 'Revisions');
    para(
      'Revision requests beyond the agreed number may require additional charges and revised delivery dates.'
    );

    heading(7, 'Intellectual Property');
    para(
      'Unless otherwise agreed, ownership of final deliverables transfers only after full payment. Until then all ' +
      'intellectual property remains with Party A.'
    );

    heading(8, 'Confidentiality');
    para(
      'Both Parties shall keep confidential all non-public information exchanged during the relationship except ' +
      'where disclosure is required by law.'
    );

    heading(9, 'Changes');
    para(
      'No amendment is valid unless accepted by both Parties through the AgreeKaro platform as a new version.'
    );

    heading(10, 'Termination');
    para(
      'Either Party may terminate where legally permitted. Completed work remains payable. Rights accrued ' +
      'before termination survive.'
    );

    heading(11, 'Force Majeure');
    para(
      'Neither Party is liable for delays caused by events beyond reasonable control including disasters, ' +
      'government restrictions and similar events.'
    );

    heading(12, 'Compliance with Applicable Laws');
    para(
      'Each Party agrees to comply with all applicable laws, regulations and legally enforceable obligations ' +
      'relevant to this Agreement based on the Parties, place of performance or competent jurisdiction. If any ' +
      'clause is unenforceable, the remaining clauses remain effective.'
    );

    heading(13, 'Platform Role');
    para(
      'AgreeKaro is an independent technology platform that facilitates the creation, management, electronic ' +
      'acceptance, secure storage, and verification of digital agreements between Party A and Party B.'
    );
    para(
      'AgreeKaro charges a Platform Service Fee solely for providing agreement generation, digital acceptance, ' +
      'document management, audit trail, verification, and other platform-related services. This fee is ' +
      'independent of, and shall not be considered part of, the commercial value, project cost, service charges, ' +
      'or any financial consideration agreed upon between the Parties under this Agreement.'
    );
    para(
      'AgreeKaro is not a contracting party to this Agreement and does not represent, employ, supervise, endorse, ' +
      'guarantee, or control either Party. AgreeKaro does not provide legal advice, legal representation, financial ' +
      'services, payment processing, escrow services, employment services, arbitration, mediation, or dispute ' +
      'resolution services unless expressly stated otherwise.'
    );
    para(
      'All payments, advances, milestone payments, balances, refunds, reimbursements, taxes, invoices, and any ' +
      'other financial obligations arising from this Agreement shall be negotiated, processed, and settled directly ' +
      'between Party A and Party B through payment methods chosen by them independently. AgreeKaro does not ' +
      'collect, receive, hold, transfer, process, guarantee, or safeguard any payments made under this Agreement.'
    );
    para(
      "The Parties acknowledge and agree that payment of AgreeKaro's Platform Service Fee constitutes payment " +
      "only for the use of the AgreeKaro platform and its services. Such payment does not constitute payment for " +
      "the underlying project, goods, services, or contractual obligations between the Parties, and shall not " +
      "satisfy, reduce, or replace any payment obligation owed by one Party to the other."
    );
    para(
      'Accordingly, AgreeKaro shall not be liable for any dispute, claim, loss, damage, delay, non-payment, ' +
      'underpayment, overpayment, refund request, project cancellation, quality of work, failure to perform, ' +
      'breach of contract, or any other matter arising from or relating to the commercial relationship between ' +
      'the Parties. Such matters shall remain the sole responsibility of Party A and Party B.'
    );
    para(
      "The Parties acknowledge that AgreeKaro's role is limited to providing a secure technology platform for " +
      'documenting agreements, recording digital acceptance, and maintaining electronic records and audit trails. ' +
      'Except to the extent required by applicable law, AgreeKaro assumes no responsibility for the performance, ' +
      'fulfillment, or enforcement of the obligations undertaken by either Party under this Agreement.'
    );

    heading(14, 'NO AGENCY RELATIONSHIP');
    para(
      'Nothing contained in this Agreement, nor the use of the AgreeKaro platform, shall be interpreted or ' +
      'construed as creating any partnership, joint venture, agency, fiduciary, employment, franchise, brokerage, ' +
      'representative, or similar legal relationship between AgreeKaro and either Party, or between the Parties ' +
      'themselves unless expressly stated in writing.'
    );
    para(
      'AgreeKaro acts solely as an independent technology platform and shall not be considered an agent, ' +
      'representative, broker, intermediary, employer, employee, consultant, guarantor, trustee, legal ' +
      'representative, or authorized signatory of either Party.'
    );
    para(
      'Each Party enters into this Agreement voluntarily, independently, and on its own behalf and shall remain ' +
      'solely responsible for its own actions, representations, obligations, liabilities, and compliance with all ' +
      'applicable laws.'
    );
    para(
      'Neither Party shall have any authority to bind AgreeKaro or the other Party to any obligation, ' +
      'representation, warranty, commitment, or liability except as expressly provided in this Agreement.'
    );

    heading(15, 'NO GUARANTEE OF PERFORMANCE');
    para(
      'AgreeKaro provides only the technological infrastructure for generating, managing, electronically accepting, ' +
      'storing, and verifying digital agreements.'
    );
    para(
      'AgreeKaro does not verify or guarantee the identity, legal capacity, authority, qualifications, financial ' +
      'capability, business legitimacy, credibility, reputation, performance, quality of work, delivery of services, ' +
      'completion of projects, payment obligations, or contractual compliance of either Party.'
    );
    para(
      'The Parties acknowledge that they are solely responsible for conducting their own due diligence before ' +
      'entering into this Agreement.'
    );
    para(
      'AgreeKaro makes no representation or warranty regarding the accuracy, completeness, legality, ' +
      'enforceability, suitability, or commercial viability of any information, document, communication, ' +
      'representation, or promise made by either Party.'
    );
    para(
      'Each Party assumes full responsibility for the decision to enter into this Agreement and for any ' +
      'commercial, financial, legal, or operational risks arising from such decision.'
    );

    heading(16, 'ELECTRONIC RECORDS & DIGITAL EVIDENCE');
    para(
      'The Parties acknowledge that AgreeKaro maintains electronic records relating to the creation, transmission, ' +
      'review, acceptance, and integrity of this Agreement.'
    );
    para('Such records may include, without limitation:');
    bullet('Agreement metadata');
    bullet('Agreement version history');
    bullet('Agreement creation records');
    bullet('Electronic acceptance records');
    bullet('Email-based OTP verification records');
    bullet('Timestamp records');
    bullet('IP address records');
    bullet('Browser information');
    bullet('Device information');
    bullet('Operating system information');
    bullet('Timezone information');
    bullet('SHA-256 Document Hash');
    bullet('Document Integrity Certificate');
    bullet('Digital Audit Trail');
    bullet(
      'Other technical and verification records reasonably necessary to establish the creation, acceptance, and ' +
      'integrity of the Agreement.'
    );
    para(
      'To the extent permitted under applicable law, the Parties acknowledge that these electronic records are ' +
      'intended to provide reliable evidence regarding the creation, transmission, review, acceptance, ' +
      'authenticity, and integrity of this Agreement.'
    );
    para(
      'The admissibility, evidentiary value, and legal effect of such electronic records shall be determined in ' +
      'accordance with the applicable laws, rules of evidence, and procedures governing the relevant jurisdiction.'
    );
    para(
      'AgreeKaro shall use commercially reasonable measures to preserve the integrity of these electronic records. ' +
      'However, AgreeKaro does not warrant or guarantee that any court, tribunal, arbitrator, governmental ' +
      'authority, or regulatory body will admit or assign any particular evidentiary weight to such records.'
    );

    heading(17, 'SEVERABILITY');
    para(
      'If any provision of this Agreement is determined by a court or other competent authority to be invalid, ' +
      'illegal, unenforceable, or incapable of being enforced, such provision shall be modified only to the extent ' +
      'necessary to make it enforceable. If such modification is not legally possible, the affected provision shall ' +
      'be deemed severed from this Agreement.'
    );
    para(
      'The remaining provisions shall continue in full force and effect and shall remain binding upon the Parties ' +
      'to the maximum extent permitted by applicable law.'
    );

    heading(18, 'WAIVER');
    para(
      'No failure, delay, omission, or partial exercise by either Party in exercising any right, remedy, power, or ' +
      'privilege under this Agreement shall constitute or operate as a waiver of such right, remedy, power, or ' +
      'privilege.'
    );
    para(
      'Any waiver shall be valid only if expressly made in writing by the Party granting such waiver and shall ' +
      'apply solely to the specific matter for which it was given.'
    );
    para(
      'No waiver of any breach shall constitute a waiver of any subsequent or continuing breach.'
    );

    heading(19, 'SURVIVAL');
    para(
      'The rights and obligations of the Parties which, by their nature or express wording, are intended to ' +
      'survive the completion, expiration, cancellation, or termination of this Agreement shall continue in full ' +
      'force and effect.'
    );
    para('Such provisions include, without limitation:');
    bullet('Payment obligations');
    bullet('Confidentiality');
    bullet('Intellectual Property Rights');
    bullet('Limitation of Liability');
    bullet('Compliance with Applicable Laws');
    bullet('Electronic Records');
    bullet('Digital Verification');
    bullet('Audit Trail');
    bullet('Platform Role');
    bullet('No Agency Relationship');
    bullet('Any provision intended to survive by its nature');

    heading(20, 'Limitation of Liability');
    para(
      'Except where liability cannot legally be excluded or limited under applicable law, neither Party shall be ' +
      'liable to the other Party for any indirect, incidental, special, consequential, exemplary, or punitive ' +
      'damages arising out of or in connection with this Agreement.'
    );
    para(
      'Such damages may include, without limitation, loss of profits, loss of business opportunities, loss of ' +
      'anticipated savings, loss of goodwill, loss of reputation, loss of data, or business interruption.'
    );
    para(
      'Each Party shall remain responsible for its own actions, omissions, representations, contractual ' +
      'obligations, payments, and compliance with applicable laws.'
    );
    para(
      'Nothing in this Agreement shall exclude or limit liability for fraud, fraudulent misrepresentation, willful ' +
      'misconduct, or any liability that cannot legally be excluded or limited under applicable law.'
    );
    para(
      'For clarity, AgreeKaro is not a Party to this Agreement and shall not be responsible for any payment ' +
      'dispute, non-payment, project delay, quality issue, failure to perform, breach, or other commercial dispute ' +
      'between the Parties, except to the extent liability is imposed on AgreeKaro by applicable law.'
    );

    heading(21, 'Entire Agreement');
    para(
      'This Agreement constitutes the complete and final understanding between the Parties concerning the ' +
      'subject matter covered by this Agreement and supersedes all prior discussions, negotiations, proposals, ' +
      'quotations, communications, emails, messages, representations, understandings, or agreements relating to ' +
      'the same subject matter.'
    );
    para(
      'The Parties acknowledge that they have entered into this Agreement based on the terms expressly contained ' +
      'in this document.'
    );
    para(
      'Any amendment, modification, addition, deletion, or variation to this Agreement shall be valid only if ' +
      'mutually accepted by both Parties and incorporated into a new or revised version of the Agreement through ' +
      'the AgreeKaro platform or otherwise documented and accepted in writing.'
    );
    para(
      'Informal communications, including messages, emails, calls, or verbal discussions, shall not modify or ' +
      'override this Agreement unless the relevant change is expressly documented and accepted by both Parties.'
    );
    para(
      'Where a newly accepted version of this Agreement exists, the most recently accepted version shall ' +
      'supersede the previous version with respect to the matters expressly modified therein.'
    );

    heading(22, 'Digital Acceptance');
    para(
      'The Parties acknowledge and agree that this Agreement may be executed electronically through the ' +
      'AgreeKaro platform and that electronic acceptance shall constitute the Parties\u2019 acceptance of the ' +
      'Agreement to the fullest extent permitted by applicable law.'
    );
    para(
      'The electronic acceptance process may include email-based OTP verification, secure acceptance links, ' +
      'timestamps, IP address records, browser information, device information, operating system information, ' +
      'timezone information, agreement version records, audit trail records, and document hash values.'
    );
    para('By completing the electronic acceptance process, each Party confirms that:');
    bullet('they have read and understood the Agreement;');
    bullet('they voluntarily accept its terms;');
    bullet('they have the legal capacity and authority to enter into the Agreement;');
    bullet('the information provided by them is accurate to the best of their knowledge; and');
    bullet(
      'their electronic acceptance is intended to create a binding agreement between the Parties, subject to ' +
      'applicable law.'
    );
    para(
      'The electronic records generated and maintained by AgreeKaro are intended to provide evidence of the ' +
      'creation, transmission, review, acceptance, and integrity of the Agreement to the extent permitted by ' +
      'applicable law.'
    );
    para(
      'The admissibility, evidentiary value, and legal effect of such electronic records shall be determined in ' +
      'accordance with the applicable laws and procedures of the relevant jurisdiction.'
    );
    para(
      'AgreeKaro does not guarantee that any particular court, tribunal, governmental authority, or other ' +
      'competent authority will assign any specific evidentiary value to such records.'
    );

    heading(23, 'NOTICES');
    para(
      'Unless otherwise expressly agreed in writing, all notices, communications, requests, approvals, demands, ' +
      'consents, or other formal communications relating to this Agreement shall be made through the AgreeKaro ' +
      'platform or sent to the email address provided by the relevant Party during the creation or acceptance of ' +
      'this Agreement.'
    );
    para(
      'Each Party shall be responsible for ensuring that its registered email address and other contact information ' +
      'remain accurate and up to date throughout the duration of the Agreement. A Party shall promptly update ' +
      'its information if any registered contact details change.'
    );
    para('A notice shall be deemed to have been delivered when:');
    bullet('it is successfully transmitted through the AgreeKaro platform;');
    bullet("successful transmission to the recipient's registered email address is recorded; or");
    bullet(
      'such other delivery or transmission is recorded through the electronic records maintained by the ' +
      'AgreeKaro platform.'
    );
    para(
      'Where applicable, the AgreeKaro platform may record delivery status, timestamps, email transmission ' +
      'records, platform activity, audit trail information, and other relevant electronic records associated with ' +
      'a notice.'
    );
    para(
      'To the extent permitted by applicable law, such records may be used as evidence of the transmission and ' +
      'delivery of the relevant communication.'
    );
    para(
      "A Party's failure to monitor, access, or respond to its registered email account or AgreeKaro account shall " +
      "not, by itself, invalidate a notice that has been properly transmitted in accordance with this Agreement."
    );
    para(
      'Nothing in this section shall prevent either Party from using any additional method of communication or ' +
      'notice where such method is required by applicable law or expressly agreed between the Parties.'
    );

    heading(null, 'Digital Audit Trail');
    ensureSpace(150);
    drawTable(
      ['Event', 'Date & Time', 'Details'],
      [
        ['Agreement Created', fmtDateTime(a.createdAt), 'Agreement created by Party A'],
        ['Link Generated', fmtDateTime(a.paidAt || a.createdAt), 'Secure agreement link generated'],
        ['Viewed', fmtDateTime(acceptedAt || a.createdAt), 'Agreement viewed by Party B'],
        ['Email Verified', fmtDateTime(acceptedAt), 'Party B email verified via OTP'],
        ['Accepted', fmtDateTime(acceptedAt), 'Agreement electronically accepted by Party B'],
        ['PDF Generated', fmtDateTime(acceptedAt || new Date()), 'Final agreement generated and locked']
      ],
      [110, 130, 255]
    );
    doc.moveDown(0.5);

    heading(null, 'Final Declaration');
    para(
      'By electronically accepting this Agreement, the Parties confirm that they have read, understood, and ' +
      'voluntarily agreed to all of its terms and conditions. Each Party further confirms that it has the legal ' +
      'capacity and authority to enter into this Agreement and that the information provided by it is accurate to ' +
      'the best of its knowledge.'
    );
    para(
      'The Parties acknowledge that the electronic acceptance process and digital records generated and ' +
      'maintained by AgreeKaro, including applicable timestamps, verification records, audit trail information, ' +
      'agreement version records, and document integrity records, are intended to provide evidence of the ' +
      'creation, acceptance, and integrity of this Agreement to the extent permitted under applicable law.'
    );
    para(
      'The Parties further acknowledge that AgreeKaro does not independently verify the truthfulness, accuracy, ' +
      'legal capacity, performance, or contractual compliance of either Party and that each Party remains solely ' +
      'responsible for its own representations, obligations, actions, and compliance with applicable laws.'
    );
    para(
      'The admissibility, evidentiary value, and legal effect of electronic records generated through the ' +
      'AgreeKaro platform shall be determined in accordance with the applicable laws and procedures of the ' +
      'relevant jurisdiction.'
    );

    heading(24, 'Execution');
    para(
      'IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed on the dates indicated below ' +
      'through their electronic acceptance on the AgreeKaro platform.'
    );

    ensureSpace(46);
    doc.moveDown(0.4);
    doc.roundedRect(MARGIN.left, doc.y, CONTENT_WIDTH, 30, 6).fill('#f0fdf4').stroke('#bbf7d0');
    doc.fillColor('#15803d').font(F.bold).fontSize(8.5).text('Digitally executed through AgreeKaro', MARGIN.left + 14, doc.y + 9);
    doc.fillColor('#166534').font(F.regular).fontSize(8.5)
      .text('This document carries a digital audit trail and records that cannot be altered after execution.', MARGIN.left + 190, doc.y + 9, { width: CONTENT_WIDTH - 204, lineGap: 1 });
    doc.y += 38;

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = { generatePDF, PDF_VERSION };
