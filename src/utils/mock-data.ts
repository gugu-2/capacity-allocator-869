
import { addDays } from "date-fns";
import { TeamMember, Project, Role, TeamMemberAllocation } from "@/types/types";

// Mock team members data
export const teamMembers: TeamMember[] = [
  { id: 1, name: "Alex Johnson", role: "Frontend Developer", fte: 1.0 },
  { id: 2, name: "Sam Williams", role: "Backend Developer", fte: 0.8 },
  { id: 3, name: "Jordan Taylor", role: "Designer", fte: 0.6 },
  { id: 4, name: "Casey Parker", role: "Product Manager", fte: 1.0 },
  { id: 5, name: "Riley Morgan", role: "QA Engineer", fte: 0.7 },
  { id: 6, name: "Jamie Roberts", role: "DevOps Engineer", fte: 0.9 },
  { id: 7, name: "Quinn Adams", role: "Frontend Developer", fte: 1.0 },
  { id: 8, name: "Avery Martinez", role: "Backend Developer", fte: 0.8 },
  { id: 9, name: "Taylor Wilson", role: "Designer", fte: 0.5 },
  { id: 10, name: "Morgan Smith", role: "Product Manager", fte: 0.6 },
];

// Mock projects data
export const projects: Project[] = [
  { id: 1, name: "Website Redesign", endDate: addDays(new Date(), 30) },
  { id: 2, name: "Mobile App Development", endDate: addDays(new Date(), 60) },
  { id: 3, name: "API Integration", endDate: addDays(new Date(), 45) },
  { id: 4, name: "Infrastructure Upgrade", endDate: addDays(new Date(), 20) },
];

// Mock roles data
export const roles: Role[] = [
  { id: 1, name: "Frontend Developer", color: "#3498db" },
  { id: 2, name: "Backend Developer", color: "#2ecc71" },
  { id: 3, name: "Designer", color: "#9b59b6" },
  { id: 4, name: "Product Manager", color: "#e74c3c" },
  { id: 5, name: "QA Engineer", color: "#f39c12" },
  { id: 6, name: "DevOps Engineer", color: "#1abc9c" },
];

// Function to generate sample allocation data
export const generateAllocationData = (): TeamMemberAllocation[] => {
  const allocations = [];
  
  for (const member of teamMembers) {
    const memberAllocations = [];
    
    // Randomly assign 0-2 projects to each team member
    const numProjects = Math.floor(Math.random() * 3);
    const assignedProjects = [];
    
    for (let i = 0; i < numProjects; i++) {
      // Pick a random project
      let projectIndex;
      do {
        projectIndex = Math.floor(Math.random() * projects.length);
      } while (assignedProjects.includes(projectIndex));
      
      assignedProjects.push(projectIndex);
      const project = projects[projectIndex];
      
      // Random allocation between 0.1 and 0.5 of their FTE
      const allocation = Math.round((0.1 + Math.random() * 0.4) * 10) / 10;
      
      memberAllocations.push({
        projectId: project.id,
        projectName: project.name,
        allocation,
        endDate: project.endDate
      });
    }
    
    // Calculate available FTE
    const totalAllocated = memberAllocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
    const availableFte = Math.round((member.fte - totalAllocated) * 10) / 10;
    
    allocations.push({
      ...member,
      allocations: memberAllocations,
      availableFte
    });
  }
  
  return allocations;
};

// Generate sample capacity data
export const generateCapacityData = (start: Date, numWeeks: number) => {
  const data = [];
  
  // Base values
  const baseCapacity = 10;
  const basePlanned = 6;
  
  // Generate week-by-week data
  for (let i = 0; i < numWeeks; i++) {
    const weekStart = addDays(start, i * 7);
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
    const totalCapacity = baseCapacity * randomFactor;
    
    const plannedCapacity = basePlanned * (0.9 + Math.random() * 0.3);
    const netAvailable = totalCapacity - plannedCapacity;
    
    data.push({
      week: i + 1,
      date: weekStart,
      totalCapacity,
      plannedCapacity,
      netAvailable,
    });
  }
  
  return data;
};

// Generate role-based capacity data
export const generateRoleCapacityData = (start: Date, numWeeks: number) => {
  const data = [];
  
  // Generate week-by-week data
  for (let i = 0; i < numWeeks; i++) {
    const weekStart = addDays(start, i * 7);
    
    let weekData = {
      week: i + 1,
      date: weekStart,
    };
    
    // Add data for each role
    roles.forEach(role => {
      // Base capacity between 1.5 and 3.5
      const baseCapacity = 1.5 + Math.random() * 2;
      
      // Planned is usually between 50-90% of capacity
      const plannedFactor = 0.5 + Math.random() * 0.4;
      const planned = baseCapacity * plannedFactor;
      
      // Net available is the difference
      const netAvailable = baseCapacity - planned;
      
      weekData = {
        ...weekData,
        [`${role.name}_capacity`]: baseCapacity,
        [`${role.name}_planned`]: planned,
        [`${role.name}_available`]: netAvailable,
      };
    });
    
    data.push(weekData);
  }
  
  return data;
};

// Sample initial planned roles data
export const initialPlannedRoles = [
  { 
    id: 1, 
    role: "Frontend Developer", 
    fte: 0.5, 
    startDate: new Date(), 
    endDate: addDays(new Date(), 30),
    project: "Website Redesign"
  },
  { 
    id: 2, 
    role: "Backend Developer", 
    fte: 0.8, 
    startDate: addDays(new Date(), 7), 
    endDate: addDays(new Date(), 45),
    project: "API Integration"
  },
  { 
    id: 3, 
    role: "Designer", 
    fte: 0.3, 
    startDate: new Date(), 
    endDate: addDays(new Date(), 15),
    project: "Mobile App Development"
  }
];
