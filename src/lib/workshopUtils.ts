export interface WhatsAppBatchLink {
  batchNumber: number;
  url: string;
}

export interface WorkshopConfig {
  id: string;
  title: string;
  badge?: string;
  schedule_date?: string;
  venue?: string;
  fee: number;
  batch_size_limit: number;
  whatsapp_links?: WhatsAppBatchLink[];
  fallback_whatsapp_link?: string;
  syllabus?: string[];
}

export function resolveStudentWhatsAppLink(
  workshop: WorkshopConfig,
  batchNumber: number
): string {
  if (!workshop) return '';
  const links = workshop.whatsapp_links || [];
  const match = links.find((l) => Number(l.batchNumber) === Number(batchNumber));
  if (match && match.url.trim()) {
    return match.url.trim();
  }
  return workshop.fallback_whatsapp_link || '';
}