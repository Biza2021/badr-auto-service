"use client";

import { useState } from "react";
import { Download, Mail, Printer } from "lucide-react";

type InvoiceActionsProps = {
  pdfUrl: string;
  pdfFileName: string;
  whatsappUrl: string | null;
};

export function InvoiceActions({ pdfUrl, pdfFileName, whatsappUrl }: InvoiceActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function downloadPdf() {
    setMessage(null);
    setIsDownloading(true);

    try {
      const response = await fetch(pdfUrl, { credentials: "same-origin" });
      if (!response.ok) {
        throw new Error("La génération du PDF a échoué.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Impossible de générer le PDF. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  }

  function printInvoice() {
    setMessage(null);
    window.print();
  }

  function showMissingPhone() {
    setMessage("Numéro de téléphone client manquant. Ajoutez un téléphone avant l’envoi WhatsApp.");
  }

  return (
    <div className="print-hidden flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
      <button className="btn-secondary w-full sm:w-auto" type="button" onClick={downloadPdf} disabled={isDownloading}>
        <Download className="h-4 w-4" aria-hidden="true" />
        {isDownloading ? "Génération du PDF..." : "Télécharger PDF"}
      </button>
      <button className="btn-secondary w-full sm:w-auto" type="button" onClick={printInvoice}>
        <Printer className="h-4 w-4" aria-hidden="true" />
        Imprimer
      </button>
      {whatsappUrl ? (
        <a className="btn-primary w-full sm:w-auto" href={whatsappUrl} target="_blank" rel="noreferrer">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Envoyer au client
        </a>
      ) : (
        <button className="btn-primary w-full sm:w-auto" type="button" onClick={showMissingPhone}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          Envoyer au client
        </button>
      )}
      {message ? (
        <p className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}
