
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { format, addWeeks, startOfWeek } from "date-fns";
import { Download, Users, Briefcase, TrendingUp } from "lucide-react";
import CapacityChart from "@/components/CapacityChart";
import RoleCapacityChart from "@/components/RoleCapacityChart";
import AvailabilityTable from "@/components/AvailabilityTable";
import PlannedRolesTable from "@/components/PlannedRolesTable";
import { useToast } from "@/components/ui/use-toast";
import { exportToExcel, formatCapacityDataForExport, formatAvailabilityDataForExport, formatPlannedRolesDataForExport } from "@/utils/exportUtils";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("availability");
  const [weeks, setWeeks] = useState<number>(12);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addWeeks(new Date(), 12));
  const [minFte, setMinFte] = useState<number>(0);
  const [maxFte, setMaxFte] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [plannedRolesData, setPlannedRolesData] = useState<any[]>([]);
  
  // Data states for exports
  const [capacityChartData, setCapacityChartData] = useState<any[]>([]);
  const [availabilityTableData, setAvailabilityTableData] = useState<any[]>([]);
  const [plannedCapacityChartData, setPlannedCapacityChartData] = useState<any[]>([]);
  const [roleCapacityChartData, setRoleCapacityChartData] = useState<any[]>([]);

  const metrics = {
    totalFteDays: 248,
    activeTeamMembers: 12,
    plannedProjects: 8,
    netAvailableFteDays: 120
  };

  useEffect(() => {
    setEndDate(addWeeks(startDate, weeks));
  }, [weeks, startDate]);

  const handleWeeksChange = (value: number[]) => {
    setWeeks(value[0]);
  };

  const handleExportData = (type: string) => {
    setIsLoading(true);
    
    try {
      switch (type) {
        case 'capacity':
          exportToExcel(
            formatCapacityDataForExport(capacityChartData),
            'Total_FTE_Availability',
            'Capacity'
          );
          break;
        case 'availability':
          exportToExcel(
            formatAvailabilityDataForExport(availabilityTableData),
            'Filtered_Availability_Data',
            'Availability'
          );
          break;
        case 'planned-capacity':
          exportToExcel(
            formatCapacityDataForExport(plannedCapacityChartData),
            'Total_FTE_Capacity_Planned_Usage',
            'PlannedCapacity'
          );
          break;
        case 'roles':
          exportToExcel(
            formatPlannedRolesDataForExport(plannedRolesData),
            'Role_Based_FTE_Availability',
            'Roles'
          );
          break;
        default:
          throw new Error('Unknown export type');
      }
      
      toast({
        title: "Export Successful",
        description: `Your ${type} data has been exported.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlannedRolesChange = (roles: any[]) => {
    setPlannedRolesData(roles);
  };

  const handleAvailabilityTableDataChange = (data: any[]) => {
    setAvailabilityTableData(data);
  };

  const handleRoleCapacityDataChange = (data: any[]) => {
    setRoleCapacityChartData(data);
  };

  return (
    <div className="min-h-screen dark bg-[#050203] text-[#FAFDFF]">
      <header className="bg-[#121212] border-b border-gray-800 shadow-lg">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0000FF] rounded-md flex items-center justify-center">
                <TrendingUp className="text-[#FAFDFF] w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold text-[#FAFDFF]">St<span className="text-[#0000FF]">AI</span>ffing</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="shadow-md border-[#222222] bg-[#121212]">
              <CardHeader className="bg-gradient-to-r from-[#0000FF]/10 to-transparent">
                <CardTitle className="text-[#FAFDFF]">Configuration</CardTitle>
                <CardDescription className="text-gray-400">Adjust your dashboard settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="weeks" className="text-[#FAFDFF]">Number of Weeks: {weeks}</Label>
                  <Slider 
                    id="weeks"
                    defaultValue={[weeks]} 
                    min={1} 
                    max={52} 
                    step={1} 
                    onValueChange={handleWeeksChange}
                    className="[&>.bg-primary]:bg-[#0000FF] [&>span]:opacity-100 [&>span]:bg-[#0000FF]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#FAFDFF]">Start Date</Label>
                  <div className="border rounded-md border-gray-700">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      className="rounded-md border-gray-700 bg-[#121212] text-[#FAFDFF]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[#FAFDFF]">FTE Range</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={minFte}
                      onChange={(e) => setMinFte(parseFloat(e.target.value))}
                      className="w-20 focus-visible:ring-[#0000FF] bg-[#121212] border-gray-700 text-[#FAFDFF]"
                    />
                    <span className="text-[#FAFDFF]">to</span>
                    <Input 
                      type="number" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={maxFte}
                      onChange={(e) => setMaxFte(parseFloat(e.target.value))}
                      className="w-20 focus-visible:ring-[#0000FF] bg-[#121212] border-gray-700 text-[#FAFDFF]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-[#FAFDFF]">Search</Label>
                  <Input 
                    id="search"
                    type="text" 
                    placeholder="Search by name or project" 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="focus-visible:ring-[#0000FF] bg-[#121212] border-gray-700 text-[#FAFDFF]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF]/10"
                  onClick={() => {
                    setSearchText("");
                    setMinFte(0);
                    setMaxFte(1);
                    setStartDate(new Date());
                    setWeeks(12);
                  }}
                >
                  Reset Filters
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Card className="bg-[#121212] border-[#222222] shadow-md transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Users className="w-8 h-8 text-[#0000FF] mb-2" />
                    <p className="text-sm text-gray-400">Team Members</p>
                    <p className="text-2xl font-bold text-[#FAFDFF]">{metrics.activeTeamMembers}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#121212] border-[#222222] shadow-md transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Briefcase className="w-8 h-8 text-[#0000FF] mb-2" />
                    <p className="text-sm text-gray-400">Projects</p>
                    <p className="text-2xl font-bold text-[#FAFDFF]">{metrics.plannedProjects}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#121212] border-[#222222] shadow-md transition-all duration-300 hover:shadow-lg col-span-2">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-400">Total FTE Days</p>
                      <p className="text-2xl font-bold text-[#FAFDFF]">{metrics.totalFteDays}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-400">Net Available</p>
                      <p className="text-2xl font-bold text-[#0000FF]">{metrics.netAvailableFteDays}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="availability" onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 bg-[#121212] border border-gray-800">
                <TabsTrigger 
                  value="availability" 
                  className="data-[state=active]:bg-[#0000FF] data-[state=active]:text-[#FAFDFF] text-gray-400"
                >
                  Current Availability
                </TabsTrigger>
                <TabsTrigger 
                  value="planned"
                  className="data-[state=active]:bg-[#0000FF] data-[state=active]:text-[#FAFDFF] text-gray-400"
                >
                  Planned Roles
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="availability" className="space-y-8">
                <Card className="shadow-md border-[#222222] bg-[#121212] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0000FF]/10 to-transparent">
                    <div>
                      <CardTitle className="text-[#FAFDFF]">Total FTE Availability</CardTitle>
                      <CardDescription className="text-gray-400">
                        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportData('capacity')}
                      disabled={isLoading}
                      className="border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF]/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <CapacityChart 
                        startDate={startDate} 
                        endDate={endDate} 
                        weeks={weeks}
                        showSeries={["totalCapacity"]}
                        id="total-fte-availability-chart"
                        onDataChange={setCapacityChartData}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-[#222222] bg-[#121212] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0000FF]/10 to-transparent">
                    <div>
                      <CardTitle className="text-[#FAFDFF]">Filtered Availability Data</CardTitle>
                      <CardDescription className="text-gray-400">
                        {searchText ? `Search: "${searchText}"` : 'All team members'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportData('availability')}
                      disabled={isLoading}
                      className="border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF]/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <AvailabilityTable 
                      startDate={startDate}
                      endDate={endDate}
                      searchText={searchText}
                      minFte={minFte}
                      maxFte={maxFte}
                      onDataChange={handleAvailabilityTableDataChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="planned" className="space-y-8">
                <Card className="shadow-md border-[#222222] bg-[#121212] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0000FF]/10 to-transparent">
                    <div>
                      <CardTitle className="text-[#FAFDFF]">Total FTE Capacity & Planned Usage</CardTitle>
                      <CardDescription className="text-gray-400">
                        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportData('planned-capacity')}
                      disabled={isLoading}
                      className="border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF]/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <CapacityChart 
                        startDate={startDate} 
                        endDate={endDate} 
                        weeks={weeks}
                        showSeries={["totalCapacity", "plannedCapacity", "netAvailable"]}
                        plannedRolesData={plannedRolesData}
                        id="planned-capacity-chart"
                        onDataChange={setPlannedCapacityChartData}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-[#222222] bg-[#121212] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#0000FF]/10 to-transparent">
                    <div>
                      <CardTitle className="text-[#FAFDFF]">Role-based FTE Availability</CardTitle>
                      <CardDescription className="text-gray-400">Breakdown by role</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportData('roles')}
                      disabled={isLoading}
                      className="border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF]/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <RoleCapacityChart 
                        startDate={startDate} 
                        endDate={endDate} 
                        weeks={weeks}
                        onDataChange={handleRoleCapacityDataChange}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-[#222222] bg-[#121212] overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#0000FF]/10 to-transparent">
                    <CardTitle className="text-[#FAFDFF]">Planned Roles</CardTitle>
                    <CardDescription className="text-gray-400">Manage team allocation to projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PlannedRolesTable 
                      startDate={startDate}
                      endDate={endDate}
                      onRolesChange={handlePlannedRolesChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
