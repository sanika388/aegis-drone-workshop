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
  cohort_whatsapp_links?: Record<string, string>;
  fallback_whatsapp_link?: string;
  syllabus?: string[];
}

export function resolveStudentWhatsAppLink(
  workshop: WorkshopConfig,
  batchNumber: number
): string {
  if (!workshop) return '';

  const batchKey = `Batch ${batchNumber}`;

  // 1. Direct object dictionary check
  if (workshop.cohort_whatsapp_links && workshop.cohort_whatsapp_links[batchKey]) {
    const link = workshop.cohort_whatsapp_links[batchKey].trim();
    if (link) return link;
  }

  // 2. Structured array check
  const links = workshop.whatsapp_links || [];
  const match = links.find((l) => Number(l.batchNumber) === Number(batchNumber));
  if (match && match.url.trim()) {
    return match.url.trim();
  }

  // 3. Fallback
  return workshop.fallback_whatsapp_link || '';
}