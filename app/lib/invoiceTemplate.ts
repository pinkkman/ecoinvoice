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
      return (
        a[Math.floor(n / 100)] +
        " HUNDRED" +
        (n % 100 ? " " + inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " THOUSAND" +
        (n % 1000 ? " " + inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " LAKH" +
        (n % 100000 ? " " + inWords(n % 100000) : "")
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      " CRORE" +
      (n % 10000000 ? " " + inWords(n % 10000000) : "")
    );
  }

  return inWords(Math.floor(num));
}

export default function invoiceTemplate(data: InvoiceData): string {
  const totalAmount = data.products.reduce((sum, p) => sum + p.amount, 0);
  const totalQty = data.products.reduce((sum, p) => sum + p.qty, 0);
  const amountInWords = `INR ${numberToWords(totalAmount)} ONLY`;

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

  // Pad rows so the table fills the page like the reference (fixed min height)
  const minRows = 1;
  const padRowsNeeded = Math.max(0, minRows - data.products.length);
  const padRows = Array(padRowsNeeded)
    .fill(0)
    .map(
      () => `
        <tr>
          <td class="cell sl-cell">&nbsp;</td>
          <td class="cell desc-cell">&nbsp;</td>
          <td class="cell un-cell">&nbsp;</td>
          <td class="cell amt-cell">&nbsp;</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice #${data.billNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          color: #111;
          background: #fff;
          width: 794px;
          padding: 30px 36px;
        }

        .invoice-heading {
          text-align: center;
          font-size: 30px;
          letter-spacing: 6px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .box {
          border: 2px solid #000;
        }

        /* HEADER */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 14px 20px;
          border-bottom: 2px solid #000;
        }

        .logo-block {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-block img {
          height: 60px;
          width: 60px;
          object-fit: contain;
        }

        .brand-name {
          font-family: 'Times New Roman', serif;
          font-size: 36px;
          font-weight: 700;
        }

        .phones {
          text-align: right;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.6;
        }

        .phones div {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        /* ADDRESS ROW */
        .address-row {
          padding: 12px 20px;
          border-bottom: 2px solid #000;
          text-align: center;
        }

        .address-line {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .email-line {
          margin-top: 8px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* BILL TO / INVOICE DETAILS */
        .meta-row {
          display: flex;
          border-bottom: 2px solid #000;
        }

        .meta-col {
          flex: 1;
          padding: 0;
        }

        .meta-col + .meta-col {
          border-left: 2px solid #000;
        }

        .meta-header {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 8px 0;
          border-bottom: 1.5px solid #000;
        }

        .meta-body {
          padding: 14px 18px;
          font-family: Arial, sans-serif;
          font-size: 13px;
        }

        .meta-body .row {
          display: flex;
          margin-bottom: 10px;
        }

        .meta-body .row:last-child {
          margin-bottom: 0;
        }

        .meta-label {
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
          margin-right: 6px;
        }

        .meta-value {
          font-weight: 600;
        }

        .meta-col.right .meta-body .row {
          display: block;
        }

        .meta-col.right .meta-label {
          margin-right: 6px;
        }

        /* PRODUCT TABLE */
        table.items {
          width: 100%;
          border-collapse: collapse;
        }

        table.items thead th {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          padding: 10px 8px;
          border-bottom: 2px solid #000;
          border-top: 2px solid #000;
        }

        table.items thead th.sl-head { width: 60px; text-align: center; border-right: 2px solid #000; }
        table.items thead th.desc-head { text-align: center; border-right: 2px solid #000; }
        table.items thead th.un-head { width: 60px; text-align: center; border-right: 2px solid #000; }
        table.items thead th.amt-head { width: 130px; text-align: center; }

        .cell {
          padding: 12px 10px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          vertical-align: top;
        }

        .sl-cell {
          width: 60px;
          text-align: center;
          font-weight: 700;
          border-right: 2px solid #000;
        }

        .desc-cell {
          border-right: 2px solid #000;
        }

        .desc-title {
          font-size: 14.5px;
          font-weight: 400;
        }

        .desc-details {
          margin-top: 4px;
          font-style: italic;
          font-size: 12.5px;
          color: #222;
          line-height: 1.5;
        }

        .un-cell {
          width: 60px;
          text-align: center;
          font-weight: 700;
          border-right: 2px solid #000;
        }

        .amt-cell {
          width: 130px;
          text-align: left;
          font-weight: 700;
        }

        /* TOTAL ROW */
        .total-row td {
          border-top: 2px solid #000;
          padding: 10px;
          font-family: Arial, sans-serif;
        }

        .total-label-cell {
          font-family: 'Times New Roman', serif;
          font-weight: 700;
          font-size: 16px;
          text-align: center;
          border-right: 2px solid #000;
          width: 60px;
        }

        .total-words-cell {
          font-family: 'Times New Roman', serif;
          font-weight: 700;
          font-size: 13.5px;
          border-right: 2px solid #000;
        }

        .total-amount-cell {
          font-weight: 700;
          font-size: 14px;
        }

        /* EMPTY SPACE ROWS (signature area) */
        .empty-row td {
          border-top: 2px solid #000;
          height: 50px;
        }

        /* FOOTER */
        .footer {
          padding: 14px 20px;
          border-top: 2px solid #000;
          font-style: italic;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .footer-brand {
          font-style: normal;
          font-weight: 700;
          font-family: 'Times New Roman', serif;
          font-size: 13px;
        }
      </style>
    </head>
    <body>

      <div class="invoice-heading">INVOICE</div>

      <div class="box">

        <!-- HEADER -->
        <div class="header">
          <div class="logo-block">
            <img src="https://yourdomain.com/logo.png" alt="HR SALES Logo" />
            <div class="brand-name">HR SALES</div>
          </div>
          <div class="phones">
            <div>+91 8917485620</div>
            <div>+91 8280531114</div>
          </div>
        </div>

        <!-- ADDRESS -->
        <div class="address-row">
          <div class="address-line">GAFOOR COLONY, UDITNAGAR, ROURKELA, ODISHA, 769012</div>
          <div class="email-line">hr.sales.rkl@gmail.com</div>
        </div>

        <!-- BILL TO / INVOICE DETAILS -->
        <div class="meta-row">
          <div class="meta-col left">
            <div class="meta-header">BILL TO</div>
            <div class="meta-body">
              <div class="row">
                <span class="meta-label">CUSTOMER NAME :</span>
                <span class="meta-value">${data.customerName}</span>
              </div>
              <div class="row">
                <span class="meta-label">ADDRESS :</span>
                <span class="meta-value">${data.address}</span>
              </div>
              <div class="row">
                <span class="meta-label">MOB NO :</span>
                <span class="meta-value">${data.phone}</span>
              </div>
            </div>
          </div>
          <div class="meta-col right">
            <div class="meta-header">INVOICE DETAILS</div>
            <div class="meta-body">
              <div class="row">
                <span class="meta-label">BILL NO :</span>
                <span class="meta-value">${data.billNo}</span>
              </div>
              <div class="row">
                <span class="meta-label">INVOICE DATE :</span>
                <span class="meta-value">${data.invoiceDate}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PRODUCTS TABLE -->
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
            ${padRows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="total-label-cell">Total</td>
              <td class="total-words-cell">${amountInWords}</td>
              <td colspan="2" class="total-amount-cell">${totalAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="empty-row">
              <td colspan="4"></td>
            </tr>
            <tr class="empty-row">
              <td colspan="4"></td>
            </tr>
          </tfoot>
        </table>

        <!-- FOOTER -->
        <div class="footer">
          <span>thanks for doing business with us</span>
          <span class="footer-brand">HR SALES</span>
        </div>

      </div>

    </body>
    </html>
  `;
}