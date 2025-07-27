
import { TeamMemberAllocation, PlannedRole } from "@/types/types";
import { generateAllocationData, generateCapacityData, generateRoleCapacityData, initialPlannedRoles } from "@/utils/mock-data";

// Simulate API fetch delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service with authentication simulation
export const api = {
  // Auth methods
  auth: {
    getToken: async () => {
      // In a real app, this would interact with Azure AD or your auth provider
      return "mock-auth-token-" + Math.random().toString(36).substring(2);
    },
    isAuthenticated: async () => {
      // Always return true for the mock
      return true;
    }
  },
  
  // Data fetching methods
  data: {
    getAvailability: async (startDate: Date, endDate: Date): Promise<TeamMemberAllocation[]> => {
      await delay(600); // Simulate network delay
      return generateAllocationData();
    },
    
    getCapacityData: async (startDate: Date, weeks: number) => {
      await delay(400);
      return generateCapacityData(startDate, weeks);
    },
    
    getRoleCapacityData: async (startDate: Date, weeks: number) => {
      await delay(500);
      return generateRoleCapacityData(startDate, weeks);
    },
    
    getPlannedRoles: async (): Promise<PlannedRole[]> => {
      await delay(300);
      return [...initialPlannedRoles];
    },
    
    savePlannedRole: async (role: PlannedRole): Promise<PlannedRole> => {
      await delay(500);
      // In a real app, this would send data to your backend
      return { ...role };
    },
    
    deletePlannedRole: async (id: number): Promise<boolean> => {
      await delay(300);
      // In a real app, this would delete from your backend
      return true;
    }
  },
  
  // Export methods
  export: {
    exportToExcel: async (dataType: string, filters: any): Promise<string> => {
      await delay(800);
      // In a real app, this would generate and download an Excel file
      return `mock-excel-export-${dataType}-${Date.now()}.xlsx`;
    },
    
    exportToCsv: async (dataType: string, filters: any): Promise<string> => {
      await delay(600);
      // In a real app, this would generate and download a CSV file
      return `mock-csv-export-${dataType}-${Date.now()}.csv`;
    }
  }
};
