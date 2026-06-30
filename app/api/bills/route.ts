import { NextRequest, NextResponse } from "next/server";
import { launchBrowser } from "@/app/lib/browser";
import invoiceTemplate from "@/app/lib/invoiceTemplate";
import type { InvoiceData } from "@/app/lib/invoiceTemplate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let browser;

  try {
    const data: InvoiceData = await req.json();

    if (
      !data.customerName ||
      !data.billNo ||
      !data.invoiceDate ||
      !data.products?.length
    ) {
      return NextResponse.json(
        { error: "Missing required invoice fields." },
        { status: 400 }
      );
    }

    const html = invoiceTemplate(data);

    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
      })
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${data.billNo}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[/api/bills] PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}