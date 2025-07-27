
import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param sheetName Name of the sheet in Excel
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Format capacity data for Excel export
 * @param data Chart data for capacity
 */
export const formatCapacityDataForExport = (data: any[]) => {
  return data.map(item => ({
    Week: item.name,
    'Total Capacity': item.totalCapacity?.toFixed(1) || 0,
    'Planned Capacity': item.plannedCapacity?.toFixed(1) || 0,
    'Net Available': item.netAvailable?.toFixed(1) || 0
  }));
};

/**
 * Format availability data for Excel export
 * @param data Availability table data
 */
export const formatAvailabilityDataForExport = (data: any[]) => {
  return data.map(item => ({
    Name: item.name,
    Role: item.role,
    Status: item.status,
    'Start Date': item.startDate,
    'End Date': item.endDate,
    FTE: item.fte,
    Projects: item.projects.join(', ')
  }));
};

/**
 * Format planned roles data for Excel export
 * @param data Planned roles table data
 */
export const formatPlannedRolesDataForExport = (data: any[]) => {
  return data.map(item => ({
    Name: item.name,
    Role: item.role,
    Project: item.project,
    'Start Date': item.startDate,
    'End Date': item.endDate,
    FTE: item.fte
  }));
};
