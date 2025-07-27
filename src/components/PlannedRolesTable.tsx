
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface PlannedRolesTableProps {
  startDate: Date;
  endDate: Date;
  onRolesChange?: (roles: any[]) => void; // Callback to notify parent of roles data change
}

const initialRoles = [
  { id: 1, name: "Frontend Developer" },
  { id: 2, name: "Backend Developer" },
  { id: 3, name: "Designer" },
  { id: 4, name: "Product Manager" },
  { id: 5, name: "QA Engineer" },
  { id: 6, name: "DevOps Engineer" },
];

// Sample initial planned roles data
const initialPlannedRoles = [
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

const PlannedRolesTable = ({ startDate, endDate, onRolesChange }: PlannedRolesTableProps) => {
  const { toast } = useToast();
  const [plannedRoles, setPlannedRoles] = useState<any[]>([]);
  const [newRole, setNewRole] = useState({
    role: "",
    fte: 0.5,
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    project: ""
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  
  useEffect(() => {
    // Load initial data
    setPlannedRoles(initialPlannedRoles);
  }, []);
  
  useEffect(() => {
    // Notify parent component of roles data change
    if (onRolesChange) {
      onRolesChange(plannedRoles);
    }
  }, [plannedRoles, onRolesChange]);
  
  const handleAddRole = () => {
    if (!newRole.role || !newRole.project || newRole.fte <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newId = Math.max(0, ...plannedRoles.map(r => r.id)) + 1;
    
    setPlannedRoles([
      ...plannedRoles,
      {
        id: newId,
        ...newRole
      }
    ]);
    
    // Reset form
    setNewRole({
      role: "",
      fte: 0.5,
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      project: ""
    });
    
    toast({
      title: "Role Added",
      description: "The planned role has been added successfully.",
    });
  };
  
  const handleDeleteRole = (id: number) => {
    setPlannedRoles(plannedRoles.filter(role => role.id !== id));
    
    toast({
      title: "Role Removed",
      description: "The planned role has been removed.",
    });
  };
  
  const handleEditRole = (id: number) => {
    const roleToEdit = plannedRoles.find(role => role.id === id);
    
    if (roleToEdit) {
      setEditingId(id);
      setNewRole({
        role: roleToEdit.role,
        fte: roleToEdit.fte,
        startDate: roleToEdit.startDate,
        endDate: roleToEdit.endDate,
        project: roleToEdit.project
      });
    }
  };
  
  const handleUpdateRole = () => {
    if (!editingId) return;
    
    setPlannedRoles(plannedRoles.map(role => 
      role.id === editingId 
        ? { id: editingId, ...newRole } 
        : role
    ));
    
    // Reset
    setEditingId(null);
    setNewRole({
      role: "",
      fte: 0.5,
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      project: ""
    });
    
    toast({
      title: "Role Updated",
      description: "The planned role has been updated successfully.",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Add/Edit Role Form */}
      <div className="grid grid-cols-6 gap-4 p-4 border rounded-lg bg-[#0A0A0A] border-[#333333]">
        <div className="col-span-6 sm:col-span-2">
          <label className="text-sm font-medium text-[#FAFDFF]">Role</label>
          <Select
            value={newRole.role}
            onValueChange={(value) => setNewRole({...newRole, role: value})}
          >
            <SelectTrigger className="w-full mt-1 bg-[#121212] border-[#333333] text-[#FAFDFF]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-[#333333] text-[#FAFDFF]">
              {initialRoles.map(role => (
                <SelectItem key={role.id} value={role.name} className="focus:bg-[#0000FF] focus:text-[#FAFDFF]">
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-6 sm:col-span-1">
          <label className="text-sm font-medium text-[#FAFDFF]">FTE Required</label>
          <Input
            type="number"
            min="0.1"
            max="1"
            step="0.1"
            value={newRole.fte}
            onChange={(e) => setNewRole({...newRole, fte: parseFloat(e.target.value)})}
            className="mt-1 bg-[#121212] border-[#333333] text-[#FAFDFF]"
          />
        </div>
        
        <div className="col-span-6 sm:col-span-1">
          <label className="text-sm font-medium text-[#FAFDFF]">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1 bg-[#121212] border-[#333333] text-[#FAFDFF]",
                  !newRole.startDate && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newRole.startDate ? format(newRole.startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#121212] border-[#333333]">
              <Calendar
                mode="single"
                selected={newRole.startDate}
                onSelect={(date) => date && setNewRole({...newRole, startDate: date})}
                className="bg-[#121212] text-[#FAFDFF]"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="col-span-6 sm:col-span-1">
          <label className="text-sm font-medium text-[#FAFDFF]">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1 bg-[#121212] border-[#333333] text-[#FAFDFF]",
                  !newRole.endDate && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newRole.endDate ? format(newRole.endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#121212] border-[#333333]">
              <Calendar
                mode="single"
                selected={newRole.endDate}
                onSelect={(date) => date && setNewRole({...newRole, endDate: date})}
                className="bg-[#121212] text-[#FAFDFF]"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="col-span-6 sm:col-span-1">
          <label className="text-sm font-medium text-[#FAFDFF]">Project</label>
          <Input
            type="text"
            placeholder="Project name"
            value={newRole.project}
            onChange={(e) => setNewRole({...newRole, project: e.target.value})}
            className="mt-1 bg-[#121212] border-[#333333] text-[#FAFDFF]"
          />
        </div>
        
        <div className="col-span-6 sm:col-span-6 sm:col-start-6 sm:justify-self-end self-end">
          {editingId ? (
            <Button onClick={handleUpdateRole} className="bg-[#0000FF] hover:bg-[#0000FF]/80 text-[#FAFDFF]">
              <Save className="mr-2 h-4 w-4" />
              Update
            </Button>
          ) : (
            <Button onClick={handleAddRole} className="bg-[#0000FF] hover:bg-[#0000FF]/80 text-[#FAFDFF]">
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          )}
        </div>
      </div>
      
      {/* Planned Roles Table */}
      <div className="rounded-md border border-[#333333]">
        <Table>
          <TableHeader className="bg-[#1A1A1A]">
            <TableRow className="border-b border-[#333333]">
              <TableHead className="text-[#FAFDFF]">Role</TableHead>
              <TableHead className="text-[#FAFDFF]">FTE Required</TableHead>
              <TableHead className="text-[#FAFDFF]">Start Date</TableHead>
              <TableHead className="text-[#FAFDFF]">End Date</TableHead>
              <TableHead className="text-[#FAFDFF]">Project</TableHead>
              <TableHead className="text-right text-[#FAFDFF]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plannedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[#FAFDFF]">
                  No planned roles yet. Add one above.
                </TableCell>
              </TableRow>
            ) : (
              plannedRoles.map((role) => (
                <TableRow key={role.id} className="hover:bg-[#1A1A1A] border-b border-[#333333]">
                  <TableCell className="font-medium text-[#FAFDFF]">{role.role}</TableCell>
                  <TableCell className="text-[#FAFDFF]">{role.fte.toFixed(1)}</TableCell>
                  <TableCell className="text-[#FAFDFF]">{format(role.startDate, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-[#FAFDFF]">{format(role.endDate, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-[#FAFDFF]">{role.project}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditRole(role.id)}
                        className="text-[#FAFDFF] hover:text-[#0000FF]"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlannedRolesTable;
