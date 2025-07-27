
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  fte: number;
}

export interface Project {
  id: number;
  name: string;
  endDate: Date;
}

export interface Allocation {
  projectId: number;
  projectName: string;
  allocation: number;
  endDate: Date;
}

export interface TeamMemberAllocation extends TeamMember {
  allocations: Allocation[];
  availableFte: number;
}

export interface PlannedRole {
  id: number;
  role: string;
  fte: number;
  startDate: Date;
  endDate: Date;
  project: string;
}

export interface Role {
  id: number;
  name: string;
  color?: string;
}
