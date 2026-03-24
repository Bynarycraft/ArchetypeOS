export function formatCertificateNumber(id: string, issuedAt: string | Date): string {
  const year = new Date(issuedAt).getUTCFullYear();
  const token = id.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `ARC-${year}-${token}`;
}

export function certificateFileName(certificateNumber: string): string {
  return `${certificateNumber.toLowerCase()}.pdf`;
}
