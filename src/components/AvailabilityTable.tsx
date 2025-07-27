
import { useEffect, useState, useRef, useMemo } from "react";
import { format, addDays, addWeeks, differenceInWeeks, startOfWeek } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AvailabilityTableProps {
  startDate: Date;
  endDate: Date;
  searchText: string;
  minFte: number;
  maxFte: number;
  onDataChange?: (data: any[]) => void;
}

// Mock team members data
const teamMembers = [
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
const projects = [
  { id: 1, name: "Website Redesign", endDate: addDays(new Date(), 30) },
  { id: 2, name: "Mobile App Development", endDate: addDays(new Date(), 60) },
  { id: 3, name: "API Integration", endDate: addDays(new Date(), 45) },
  { id: 4, name: "Infrastructure Upgrade", endDate: addDays(new Date(), 20) },
];

// Generate mock allocation data with weekly availability
const generateAllocationData = (startDate: Date, endDate: Date) => {
  const allocations = [];
  const numWeeks = Math.max(1, differenceInWeeks(endDate, startDate));
  
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
      
      // Random start week
      const randomStartWeek = Math.floor(Math.random() * (numWeeks / 2));
      // Random duration (1-4 weeks)
      const duration = 1 + Math.floor(Math.random() * 4);
      
      memberAllocations.push({
        projectId: project.id,
        projectName: project.name,
        allocation,
        startWeek: randomStartWeek,
        duration: Math.min(duration, numWeeks - randomStartWeek),
        endDate: project.endDate
      });
    }
    
    // Generate weekly availability data
    const weeklyAvailability = [];
    for (let week = 0; week < numWeeks; week++) {
      // Start with full FTE
      let weekAllocation = 0;
      
      // Subtract allocations for this week
      memberAllocations.forEach(alloc => {
        if (week >= alloc.startWeek && week < (alloc.startWeek + alloc.duration)) {
          weekAllocation += alloc.allocation;
        }
      });
      
      // Calculate available FTE for this week
      const availableFte = Math.round((member.fte - weekAllocation) * 10) / 10;
      
      // Add some randomness to availability
      const randomFactor = 0.9 + Math.random() * 0.2; // 90-110%
      const adjustedAvailableFte = Math.min(member.fte, Math.max(0, Math.round(availableFte * randomFactor * 10) / 10));
      
      weeklyAvailability.push({
        week,
        date: addWeeks(startDate, week),
        availableFte: adjustedAvailableFte
      });
    }
    
    // Calculate total available FTE
    const totalAllocated = memberAllocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
    const availableFte = Math.round((member.fte - totalAllocated) * 10) / 10;
    
    allocations.push({
      ...member,
      allocations: memberAllocations,
      availableFte,
      weeklyAvailability
    });
  }
  
  return allocations;
};

const AvailabilityTable = ({ startDate, endDate, searchText, minFte, maxFte, onDataChange }: AvailabilityTableProps) => {
  const [data, setData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [weekHeaders, setWeekHeaders] = useState<any[]>([]);
  const prevInputsRef = useRef<string>('');
  
  // Use useMemo to compute a stable key for checking if inputs have changed
  const inputsKey = useMemo(() => {
    return JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      searchText,
      minFte,
      maxFte,
      sortConfig
    });
  }, [startDate, endDate, searchText, minFte, maxFte, sortConfig]);
  
  useEffect(() => {
    // Generate week headers only when date range changes
    const numWeeks = Math.max(1, differenceInWeeks(endDate, startDate));
    const headers = [];
    
    for (let i = 0; i < numWeeks; i++) {
      const weekStart = addWeeks(startOfWeek(startDate, { weekStartsOn: 1 }), i);
      headers.push({
        week: i,
        date: weekStart,
        label: format(weekStart, 'MMM d')
      });
    }
    
    setWeekHeaders(headers);
  }, [startDate, endDate]);
  
  useEffect(() => {
    // Only regenerate data if something important changed
    if (prevInputsRef.current !== inputsKey) {
      // Generate mock allocation data
      let allocations = generateAllocationData(startDate, endDate);
      
      // Apply filters
      allocations = allocations.filter(item => {
        // Filter by FTE range
        if (item.availableFte < minFte || item.availableFte > maxFte) {
          return false;
        }
        
        // Filter by search text
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          const nameMatch = item.name.toLowerCase().includes(searchLower);
          const roleMatch = item.role.toLowerCase().includes(searchLower);
          const projectMatch = item.allocations.some((a: any) => 
            a.projectName.toLowerCase().includes(searchLower)
          );
          
          if (!nameMatch && !roleMatch && !projectMatch) {
            return false;
          }
        }
        
        return true;
      });
      
      // Apply sorting if configured
      if (sortConfig) {
        allocations.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setData(allocations);
      prevInputsRef.current = inputsKey;
      
      // Call onDataChange callback if provided
      if (onDataChange) {
        onDataChange(allocations);
      }
    }
  }, [inputsKey, startDate, endDate, searchText, minFte, maxFte, sortConfig, onDataChange]);
  
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
  };

  // Function to render the badge for a specific FTE value
  const renderFteBadge = (fte: number) => {
    return (
      <Badge 
        variant={fte > 0.3 ? "default" : "destructive"}
        className={`font-medium ${fte > 0.3 ? "bg-[#0000FF]" : ""}`}
      >
        {fte.toFixed(1)}
      </Badge>
    );
  };
  
  // Memoize the table headers to prevent re-renders
  const tableHeaders = useMemo(() => (
    <TableHeader className="bg-[#1A1A1A]">
      <TableRow className="border-b border-[#333333]">
        <TableHead className="w-[200px] text-[#FAFDFF] sticky left-0 bg-[#1A1A1A] z-10">
          <Button variant="ghost" onClick={() => handleSort('name')} className="hover:text-[#0000FF] text-[#FAFDFF]">
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-[150px] text-[#FAFDFF]">
          <Button variant="ghost" onClick={() => handleSort('role')} className="hover:text-[#0000FF] text-[#FAFDFF]">
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-[100px] text-[#FAFDFF]">
          <Button variant="ghost" onClick={() => handleSort('fte')} className="hover:text-[#0000FF] text-[#FAFDFF]">
            Total FTE
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead className="w-[200px] text-[#FAFDFF]">Current Projects</TableHead>
        <TableHead className="w-[120px] text-[#FAFDFF]">
          <Button variant="ghost" onClick={() => handleSort('availableFte')} className="hover:text-[#0000FF] text-[#FAFDFF]">
            Avg. Available
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        {weekHeaders.map((header) => (
          <TableHead key={header.week} className="text-[#FAFDFF] text-center whitespace-nowrap w-[90px]">
            {header.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  ), [weekHeaders, handleSort]);
  
  // Memoize the table body to prevent re-renders
  const tableBody = useMemo(() => (
    <TableBody>
      {data.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5 + weekHeaders.length} className="h-24 text-center text-[#FAFDFF]">
            No results found.
          </TableCell>
        </TableRow>
      ) : (
        data.map((person) => (
          <TableRow key={person.id} className="hover:bg-[#1A1A1A] border-b border-[#333333]">
            <TableCell className="font-medium text-[#FAFDFF] sticky left-0 bg-[#050203] hover:bg-[#1A1A1A] z-10">
              {person.name}
            </TableCell>
            <TableCell className="text-[#FAFDFF]">{person.role}</TableCell>
            <TableCell className="text-[#FAFDFF]">{person.fte.toFixed(1)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {person.allocations.length === 0 ? (
                  <span className="text-gray-500 text-sm">None</span>
                ) : (
                  person.allocations.map((allocation: any, index: number) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 border-[#333333] bg-[#121212] text-[#FAFDFF]">
                      <span>{allocation.projectName}</span>
                      <span className="bg-[#222222] px-1 rounded text-xs text-[#FAFDFF]">
                        {allocation.allocation.toFixed(1)}
                      </span>
                    </Badge>
                  ))
                )}
              </div>
            </TableCell>
            <TableCell>
              {renderFteBadge(person.availableFte)}
            </TableCell>
            {weekHeaders.map((header) => {
              const weekData = person.weeklyAvailability.find((w: any) => w.week === header.week);
              return (
                <TableCell key={`${person.id}-${header.week}`} className="text-center px-2">
                  {weekData ? renderFteBadge(weekData.availableFte) : '—'}
                </TableCell>
              );
            })}
          </TableRow>
        ))
      )}
    </TableBody>
  ), [data, weekHeaders]);
  
  return (
    <div className="rounded-md border border-[#333333] overflow-x-auto">
      <Table>
        {tableHeaders}
        {tableBody}
      </Table>
    </div>
  );
};

export default AvailabilityTable;
