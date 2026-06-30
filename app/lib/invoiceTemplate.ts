export interface Product {
  title: string;
  details: string;
  qty: number;
  amount: number;
}

export interface InvoiceData {
  customerName: string;
  phone: string;
  address: string;
  billNo: string;
  invoiceDate: string;
  products: Product[];
}

export default function invoiceTemplate(data: InvoiceData): string {
  const totalAmount = data.products.reduce((sum, p) => sum + p.amount, 0);

  const rows = data.products
    .map(
      (p, i) => `
        <tr>
          <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: center; vertical-align: top;">${i + 1}</td>
          <td style="padding: 8px 6px; border: 1px solid #ddd; vertical-align: top;">
            <div style="font-weight: 600;">${p.title}</div>
            ${p.details ? `<div style="font-size: 12px; color: #444; margin-top: 3px; white-space: pre-line;">${p.details}</div>` : ""}
          </td>
          <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: center; vertical-align: top;">${p.qty}</td>
          <td style="padding: 8px 6px; border: 1px solid #ddd; text-align: right; vertical-align: top;">৳ ${p.amount.toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice #${data.billNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 14px;
          color: #111;
          background: #fff;
          padding: 40px;
          width: 794px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #1a1a2e;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .logo-block { display: flex; align-items: center; gap: 14px; }
        .logo-block img { height: 64px; width: 64px; object-fit: contain; }
        .company-name { font-size: 28px; font-weight: 800; color: #1a1a2e; letter-spacing: 1px; }
        .company-tagline { font-size: 11px; color: #666; margin-top: 2px; }
        .contact-block { text-align: right; font-size: 12px; color: #333; line-height: 1.7; }
        .invoice-title {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1a1a2e;
          margin-bottom: 20px;
          border: 2px solid #1a1a2e;
          padding: 6px 0;
        }
        .bill-meta { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 20px; }
        .bill-to { flex: 1; }
        .bill-to-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 6px; letter-spacing: 1px; }
        .bill-to-name { font-size: 16px; font-weight: 700; color: #1a1a2e; }
        .bill-to-detail { font-size: 13px; color: #444; margin-top: 3px; line-height: 1.6; }
        .bill-info { text-align: right; min-width: 180px; }
        .bill-info table { margin-left: auto; border-collapse: collapse; }
        .bill-info td { padding: 2px 6px; font-size: 13px; }
        .bill-info td:first-child { font-weight: 600; color: #555; text-align: left; }
        .bill-info td:last-child { color: #111; text-align: right; }
        .products-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .products-table thead tr { background: #1a1a2e; color: #fff; }
        .products-table thead th { padding: 10px 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
        .products-table thead th:nth-child(1) { width: 40px; text-align: center; }
        .products-table thead th:nth-child(2) { text-align: left; }
        .products-table thead th:nth-child(3) { width: 60px; text-align: center; }
        .products-table thead th:nth-child(4) { width: 100px; text-align: right; }
        .products-table tbody tr:nth-child(even) { background: #f7f7f7; }
        .total-row { display: flex; justify-content: flex-end; margin-bottom: 40px; }
        .total-box {
          border: 2px solid #1a1a2e;
          padding: 10px 20px;
          min-width: 200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .total-label { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a2e; }
        .total-amount { font-size: 18px; font-weight: 800; color: #1a1a2e; }
        .footer { margin-top: 10px; border-top: 2px solid #1a1a2e; padding-top: 30px; }
        .signatures { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .signature-block { text-align: center; min-width: 160px; }
        .signature-line { border-top: 1px solid #333; margin-bottom: 6px; }
        .signature-label { font-size: 12px; font-weight: 600; color: #444; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer-note { text-align: center; font-size: 13px; color: #555; margin-bottom: 4px; }
        .footer-brand { text-align: center; font-size: 15px; font-weight: 800; color: #1a1a2e; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-block">
          <img src="https://yourdomain.com/logo.png" alt="HR SALES Logo" />
          <div>
            <div class="company-name">HR SALES</div>
            <div class="company-tagline">Quality Products & Trusted Service</div>
          </div>
        </div>
        <div class="contact-block">
          <div>123 Business Road, Dhaka, Bangladesh</div>
          <div>+880 1XXX-XXXXXX &nbsp;|&nbsp; +880 1XXX-XXXXXX</div>
          <div>hrsales@email.com</div>
        </div>
      </div>

      <div class="invoice-title">Invoice</div>

      <div class="bill-meta">
        <div class="bill-to">
          <div class="bill-to-label">Bill To</div>
          <div class="bill-to-name">${data.customerName}</div>
          <div class="bill-to-detail">${data.address}</div>
          <div class="bill-to-detail">Phone: ${data.phone}</div>
        </div>
        <div class="bill-info">
          <table>
            <tr><td>Bill No:</td><td><strong>${data.billNo}</strong></td></tr>
            <tr><td>Date:</td><td>${data.invoiceDate}</td></tr>
          </table>
        </div>
      </div>

      <table class="products-table">
        <thead>
          <tr><th>SL</th><th>Description</th><th>Qty</th><th>Amount</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="total-row">
        <div class="total-box">
          <span class="total-label">Total</span>
          <span class="total-amount">৳ ${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div class="footer">
        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Customer Signature</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Authorized Signature</div>
          </div>
        </div>
        <div class="footer-note">Thanks for doing business with us.</div>
        <div class="footer-brand">HR SALES</div>
      </div>
    </body>
    </html>
  `;
}