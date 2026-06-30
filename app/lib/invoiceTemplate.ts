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

function numberToWords(num: number): string {
  const a = [
    "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
    "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
    "SEVENTEEN", "EIGHTEEN", "NINETEEN",
  ];
  const b = [
    "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
  ];

  if (num === 0) return "ZERO";

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return a[Math.floor(n / 100)] + " HUNDRED" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + " THOUSAND" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + " LAKH" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " CRORE" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }

  return inWords(Math.floor(num));
}

export default function invoiceTemplate(data: InvoiceData, logoUrl: string): string {
  const totalAmount = data.products.reduce((sum, p) => sum + p.amount, 0);
  const amountInWords = `INR ${numberToWords(totalAmount)} ONLY`;

  // Estimate vertical space used by product rows (rough px per row based on description lines)
  const estimatedContentHeight = data.products.reduce((sum, p) => {
    const lineCount = 1 + (p.details ? p.details.split("\n").length : 0);
    return sum + 36 + lineCount * 18; // base row padding + per line height
  }, 0);

  // Total usable height inside the box for the table body (tuned for A4 at this padding/header size)
  const AVAILABLE_HEIGHT = 480;
  const fillerHeight = Math.max(0, AVAILABLE_HEIGHT - estimatedContentHeight);

  const rows = data.products
    .map(
      (p, i) => `
        <tr>
          <td class="cell sl-cell">${i + 1}</td>
          <td class="cell desc-cell">
            <div class="desc-title">${p.title}</div>
            ${
              p.details
                ? `<div class="desc-details">${p.details
                    .split("\n")
                    .map((line) => `<div>${line}</div>`)
                    .join("")}</div>`
                : ""
            }
          </td>
          <td class="cell un-cell">${p.qty}</td>
          <td class="cell amt-cell">${p.amount.toLocaleString("en-IN")}</td>
        </tr>
      `
    )
    .join("");

  const fillerRow =
    fillerHeight > 0
      ? `
        <tr class="filler-row" style="height:${fillerHeight}px;">
          <td class="sl-cell"></td>
          <td class="desc-cell"></td>
          <td class="un-cell"></td>
          <td></td>
        </tr>
      `
      : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice #${data.billNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
          size: A4;
          margin: 0;
        }

        html, body {
          width: 794px;
        }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          color: #111;
          background: #fff;
          padding: 28px 34px;
        }

        .invoice-heading {
          text-align: center;
          font-size: 28px;
          letter-spacing: 8px;
          font-weight: 400;
          margin-bottom: 14px;
        }

        .box {
          border: 2px solid #000;
          display: flex;
          flex-direction: column;
          page-break-inside: avoid;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 12px 20px;
          border-bottom: 2px solid #000;
        }

        .logo-block { display: flex; align-items: center; gap: 14px; }
        .logo-block img { height: 64px; width: 64px; object-fit: contain; }
        .brand-name { font-family: 'Times New Roman', serif; font-size: 34px; font-weight: 700; letter-spacing: 1px; }

        .phones {
          text-align: right;
          font-family: Arial, sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.7;
        }
        .phones div { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }

        .address-row {
          padding: 10px 20px;
          border-bottom: 2px solid #000;
          text-align: center;
        }
        .address-line { font-size: 15px; font-weight: 700; letter-spacing: 0.3px; }
        .email-line {
          margin-top: 6px;
          font-family: Arial, sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .meta-row { display: flex; border-bottom: 2px solid #000; }
        .meta-col { flex: 1; }
        .meta-col + .meta-col { border-left: 2px solid #000; }
        .meta-header {
          text-align: center;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 7px 0;
          border-bottom: 1.5px solid #000;
        }
        .meta-body { padding: 13px 18px; font-family: Arial, sans-serif; font-size: 12.5px; }
        .meta-body .row { display: flex; margin-bottom: 9px; }
        .meta-body .row:last-child { margin-bottom: 0; }
        .meta-label { font-weight: 700; text-transform: uppercase; white-space: nowrap; margin-right: 6px; }
        .meta-value { font-weight: 600; }

        table.items { width: 100%; border-collapse: collapse; }
        table.items thead th {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          padding: 9px 8px;
          border-bottom: 2px solid #000;
        }
        table.items thead th.sl-head { width: 56px; text-align: center; border-right: 2px solid #000; }
        table.items thead th.desc-head { text-align: center; border-right: 2px solid #000; }
        table.items thead th.un-head { width: 56px; text-align: center; border-right: 2px solid #000; }
        table.items thead th.amt-head { width: 130px; text-align: center; }

        .cell { padding: 10px 10px; font-family: Arial, sans-serif; font-size: 14px; vertical-align: top; }
        .sl-cell { width: 56px; text-align: center; font-weight: 700; border-right: 2px solid #000; }
        .desc-cell { border-right: 2px solid #000; }
        .desc-title { font-size: 14.5px; font-weight: 400; }
        .desc-details { margin-top: 4px; font-style: italic; font-size: 12.5px; color: #222; line-height: 1.5; }
        .un-cell { width: 56px; text-align: center; font-weight: 700; border-right: 2px solid #000; }
        .amt-cell { width: 130px; text-align: left; font-weight: 700; }

        .filler-row .sl-cell,
        .filler-row .desc-cell,
        .filler-row .un-cell { border-right: 2px solid #000; }

        .total-row td { border-top: 2px solid #000; padding: 10px; font-family: Arial, sans-serif; }
        .total-label-cell {
          font-family: 'Times New Roman', serif;
          font-weight: 700;
          font-size: 16px;
          text-align: center;
          border-right: 2px solid #000;
          width: 56px;
        }
        .total-words-cell { font-family: 'Times New Roman', serif; font-weight: 700; font-size: 13px; border-right: 2px solid #000; }
        .total-amount-cell { font-weight: 700; font-size: 14px; text-align: left; padding-left: 10px; }

        .empty-row td { border-top: 2px solid #000; height: 30px; }

        .footer {
          padding: 12px 20px;
          border-top: 2px solid #000;
          font-style: italic;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .footer-brand { font-style: normal; font-weight: 700; font-family: 'Times New Roman', serif; font-size: 13px; }
      </style>
    </head>
    <body>

      <div class="invoice-heading">INVOICE</div>

      <div class="box">

        <div class="header">
          <div class="logo-block">
            <img src="${logoUrl}" alt="HR SALES Logo" />
            <div class="brand-name">HR SALES</div>
          </div>
          <div class="phones">
            <div>+91 8917485620</div>
            <div>+91 8280531114</div>
          </div>
        </div>

        <div class="address-row">
          <div class="address-line">GAFOOR COLONY, UDITNAGAR, ROURKELA, ODISHA, 769012</div>
          <div class="email-line">hr.sales.rkl@gmail.com</div>
        </div>

        <div class="meta-row">
          <div class="meta-col">
            <div class="meta-header">BILL TO</div>
            <div class="meta-body">
              <div class="row"><span class="meta-label">CUSTOMER NAME :</span><span class="meta-value">${data.customerName}</span></div>
              <div class="row"><span class="meta-label">ADDRESS :</span><span class="meta-value">${data.address}</span></div>
              <div class="row"><span class="meta-label">MOB NO :</span><span class="meta-value">${data.phone}</span></div>
            </div>
          </div>
          <div class="meta-col">
            <div class="meta-header">INVOICE DETAILS</div>
            <div class="meta-body">
              <div class="row"><span class="meta-label">BILL NO :</span><span class="meta-value">${data.billNo}</span></div>
              <div class="row"><span class="meta-label">INVOICE DATE :</span><span class="meta-value">${data.invoiceDate}</span></div>
            </div>
          </div>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th class="sl-head">SL</th>
              <th class="desc-head">Description</th>
              <th class="un-head">UN</th>
              <th class="amt-head">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            ${fillerRow}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="total-label-cell">Total</td>
              <td class="total-words-cell">${amountInWords}</td>
              <td colspan="2" class="total-amount-cell">${totalAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="empty-row"><td colspan="4"></td></tr>
            <tr class="empty-row"><td colspan="4"></td></tr>
          </tfoot>
        </table>

        <div class="footer">
          <span>thanks for doing business with us</span>
          <span class="footer-brand">HR SALES</span>
        </div>

      </div>

    </body>
    </html>
  `;
}