import jsPDF from 'jspdf';
import { Invoice, Client, DeveloperProfile } from '../types/erp';
import { formatCurrency } from './formatters';

export function exportInvoicePDF(
  invoice: Invoice,
  client?: Client,
  profile?: DeveloperProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Background accent bar at the top
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 7, 'F');

  // Top Developer Brand / Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', margin, y + 6);

  // Status Badge / Text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusColors: Record<string, [number, number, number]> = {
    Paid: [22, 163, 74],
    Sent: [37, 99, 235],
    Draft: [100, 116, 139],
    Overdue: [220, 38, 38],
  };
  const [sr, sg, sb] = statusColors[invoice.status] || [100, 116, 139];
  doc.setTextColor(sr, sg, sb);
  doc.text(`STATUS: ${invoice.status.toUpperCase()}`, margin + 55, y + 5);

  // Invoice Number & Dates (Right side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No:`, pageWidth - margin - 50, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.invoiceNumber, pageWidth - margin, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Issue Date:`, pageWidth - margin - 50, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.issueDate, pageWidth - margin, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Due Date:`, pageWidth - margin - 50, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(invoice.status === 'Overdue' ? 220 : 15, invoice.status === 'Overdue' ? 38 : 23, invoice.status === 'Overdue' ? 38 : 42);
  doc.text(invoice.dueDate, pageWidth - margin, y, { align: 'right' });

  // Divider
  y += 12;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // From / To Section
  y += 8;
  const colWidth = contentWidth / 2;

  // Billed By (Left)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED BY / DEVELOPER', margin, y);

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(profile?.developerName || 'Ibrahim Tarek', margin, y);

  y += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (profile?.developerTitle) {
    doc.text(profile.developerTitle, margin, y);
    y += 4;
  }
  if (profile?.developerEmail) {
    doc.text(profile.developerEmail, margin, y);
    y += 4;
  }
  if (profile?.developerPhone) {
    doc.text(`Phone: ${profile.developerPhone}`, margin, y);
    y += 4;
  }
  if (profile?.developerTaxId) {
    doc.text(`Tax ID: ${profile.developerTaxId}`, margin, y);
    y += 4;
  }
  if (profile?.developerAddress) {
    doc.text(profile.developerAddress, margin, y, { maxWidth: colWidth - 5 });
  }

  // Billed To (Right)
  let yRight = y - (profile?.developerAddress ? 16 : 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / CLIENT', margin + colWidth, yRight);

  yRight += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(client?.company || client?.name || 'Client', margin + colWidth, yRight);

  yRight += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (client?.name && client?.company) {
    doc.text(`Attn: ${client.name}`, margin + colWidth, yRight);
    yRight += 4;
  }
  if (client?.email) {
    doc.text(client.email, margin + colWidth, yRight);
    yRight += 4;
  }
  if (client?.taxId) {
    doc.text(`Client Tax ID: ${client.taxId}`, margin + colWidth, yRight);
    yRight += 4;
  }
  if (client?.address) {
    doc.text(client.address, margin + colWidth, yRight, { maxWidth: colWidth });
  }

  y = Math.max(y + 8, yRight + 8);

  // Line Items Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  const descColWidth = contentWidth * 0.55;
  const qtyColWidth = contentWidth * 0.12;
  const priceColWidth = contentWidth * 0.16;
  const totalColWidth = contentWidth * 0.17;

  doc.text('DESCRIPTION', margin + 3, y + 4.5);
  doc.text('QTY / HRS', margin + descColWidth, y + 4.5, { align: 'center' });
  doc.text('UNIT PRICE', margin + descColWidth + qtyColWidth + priceColWidth - 2, y + 4.5, { align: 'right' });
  doc.text('AMOUNT', pageWidth - margin - 3, y + 4.5, { align: 'right' });

  y += 7;

  // Line Items Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  invoice.items.forEach((item, idx) => {
    // Alternating row background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }

    doc.text(item.description, margin + 3, y + 5.5, { maxWidth: descColWidth - 4 });
    doc.text(String(item.quantity), margin + descColWidth, y + 5.5, { align: 'center' });
    doc.text(formatCurrency(item.unitPrice, invoice.currency), margin + descColWidth + qtyColWidth + priceColWidth - 2, y + 5.5, { align: 'right' });
    doc.text(formatCurrency(item.amount, invoice.currency), pageWidth - margin - 3, y + 5.5, { align: 'right' });

    y += 8;
  });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Calculation Block (Subtotal, Tax, Total, Local FX equivalent)
  const calcBoxWidth = 70;
  const calcBoxX = pageWidth - margin - calcBoxWidth;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', calcBoxX, y);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), pageWidth - margin, y, { align: 'right' });

  if (invoice.taxRate > 0) {
    y += 5;
    doc.text(`Tax / VAT (${Math.round(invoice.taxRate * 100)}%):`, calcBoxX, y);
    doc.text(formatCurrency(invoice.subtotal * invoice.taxRate, invoice.currency), pageWidth - margin, y, { align: 'right' });
  }

  y += 6;
  doc.setFillColor(15, 23, 42);
  doc.rect(calcBoxX - 4, y - 4, calcBoxWidth + 4, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Total Due:', calcBoxX, y + 2.5);
  doc.text(formatCurrency(invoice.total, invoice.currency), pageWidth - margin - 2, y + 2.5, { align: 'right' });

  // Base Currency Conversion Note (if not already EGP)
  if (invoice.currency !== 'EGP') {
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const convertedEGP = invoice.total * invoice.exchangeRateToLocal;
    doc.text(
      `FX Locked: 1 ${invoice.currency} = ${invoice.exchangeRateToLocal.toFixed(2)} EGP (~${formatCurrency(convertedEGP, 'EGP')})`,
      pageWidth - margin,
      y,
      { align: 'right' }
    );
  }

  // Payment Details Section
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 32, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT INSTRUCTIONS (WIRE / IBAN)', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Beneficiary Bank:`, margin + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentDetails.bankName || profile?.bankName || 'Example International Bank', margin + 35, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Account Holder:`, margin + 4, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentDetails.accountHolder || profile?.accountHolder || 'Ibrahim Tarek', margin + 35, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`IBAN Number:`, margin + 4, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentDetails.iban || profile?.iban || 'EG000000000000000000000000000', margin + 35, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`SWIFT / BIC:`, margin + 4, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.paymentDetails.swift || profile?.swift || 'EXAMPLEGXXX', margin + 35, y + 27);

  // Notes & Footer
  if (invoice.notes) {
    y += 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NOTES & TERMS', margin, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.notes, margin, y, { maxWidth: contentWidth });
  }

  // Footer stamp
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by DevERP · 100% Client-Side Cryptographic Ledger · Local Time: ${new Date().toISOString().split('T')[0]}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
