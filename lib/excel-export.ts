import * as XLSX from 'xlsx';

export interface ExportRow {
  [key: string]: any;
}

/**
 * Export approval request data to Excel format
 * @param data Array of data rows to export
 * @param columns Column definitions with key and header
 * @param fileName Name of the file to download
 */
export const exportToExcel = (
  data: ExportRow[],
  columns: { key: string; header: string }[],
  fileName: string
): void => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Create worksheet data with headers
  const wsData = [
    columns.map(col => col.header),
    ...data.map(row => columns.map(col => row[col.key] ?? ''))
  ];

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length, 15)
  }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Approval Requests');

  // Generate file and download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Format date for export (submission date only)
 * @param dateString ISO date string
 * @returns Formatted date string in en-IN locale
 */
export const formatExportDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '';
  }
};

/**
 * Get request type label
 * @param type Request type (leave, ta, proposal)
 * @returns Formatted request type label
 */
export const getRequestTypeLabel = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    leave: 'Leave',
    ta: 'Allowance Claim',
    proposal: 'Proposal'
  };
  return typeMap[type] || type;
};

/**
 * Get status label
 * @param status Request status
 * @returns Formatted status label
 */
export const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  return statusMap[status] || status;
};

/**
 * Get reason/description for export
 * @param request Request object
 * @param type Request type
 * @returns Reason or description text
 */
export const getReasonForExport = (request: any, type: string): string => {
  if (type === 'leave') {
    const reason = request.payload?.reason || '';
    return request.payload?.isPastDateRequest ? `Past-date leave: ${reason}` : reason;
  }
  if (type === 'ta') {
    return request.payload?.description || '';
  }
  if (type === 'proposal') {
    return request.payload?.projectTitle || request.payload?.abstract || '';
  }
  return '';
};
