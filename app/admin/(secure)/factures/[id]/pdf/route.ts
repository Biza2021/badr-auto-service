import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGarageSettings } from "@/lib/garage-settings";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { invoiceFileName } from "@/lib/invoice";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Params }) {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return new NextResponse("Accès refusé", { status: 403 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      repair: { include: { vehicle: true } },
      lines: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!invoice) {
    return new NextResponse("Facture introuvable", { status: 404 });
  }

  try {
    const settings = await getGarageSettings();
    const pdf = generateInvoicePdf(invoice, settings);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceFileName(invoice.invoiceNumber)}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("Erreur génération PDF facture", error);
    return new NextResponse("Impossible de générer le PDF de la facture.", { status: 500 });
  }
}
