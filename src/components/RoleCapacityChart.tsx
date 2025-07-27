import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { addDays, format } from "date-fns";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RoleCapacityChartProps {
  startDate: Date;
  endDate: Date;
  weeks: number;
  onDataChange?: (data: any[]) => void; // Callback for exporting data
}

// Mock data for roles with more distinguishable colors
const roles = [
  { id: 1, name: "Frontend Developer", color: "#8B5CF6" }, // Vivid Purple
  { id: 2, name: "Backend Developer", color: "#0EA5E9" },  // Ocean Blue
  { id: 3, name: "Designer", color: "#F97316" },           // Bright Orange
  { id: 4, name: "Product Manager", color: "#D946EF" },    // Magenta Pink
  { id: 5, name: "QA Engineer", color: "#10B981" }         // Emerald Green
];

// Mock data generator for role-based capacity
const generateRoleCapacityData = (start: Date, numWeeks: number) => {
  const data = [];
  
  // Generate week-by-week data
  for (let i = 0; i < numWeeks; i++) {
    const weekStart = addDays(start, i * 7);
    const weekLabel = format(weekStart, 'MMM d');
    
    let weekData: any = {
      name: weekLabel,
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
      
      weekData[`${role.name}_capacity`] = baseCapacity;
      weekData[`${role.name}_planned`] = planned;
      weekData[`${role.name}_available`] = netAvailable;
    });
    
    data.push(weekData);
  }
  
  return data;
};

// Custom tooltip component that shows legend colors with values
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Group by role name to show capacity and planned together
    const roleGroups: Record<string, any[]> = {};
    
    payload.forEach((entry: any) => {
      const dataKey = entry.dataKey;
      const roleName = dataKey.split('_')[0];
      
      if (!roleGroups[roleName]) {
        roleGroups[roleName] = [];
      }
      
      roleGroups[roleName].push(entry);
    });
    
    return (
      <div className="bg-[#121212] rounded-md border border-[#333333] p-3 shadow-lg">
        <p className="text-[#FAFDFF] font-medium mb-2">{`Week: ${label}`}</p>
        
        {Object.entries(roleGroups).map(([roleName, entries], roleIndex) => (
          <React.Fragment key={`role-${roleIndex}`}>
            <p className="text-[#FAFDFF] font-medium">{roleName}</p>
            
            {entries.map((entry, entryIndex) => {
              const metricName = entry.dataKey.split('_')[1];
              return (
                <div key={`metric-${entryIndex}`} className="flex items-center gap-2 ml-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <p className="text-[#FAFDFF] text-sm">
                    <span>{metricName === 'capacity' ? 'Capacity' : 
                           metricName === 'planned' ? 'Planned' : 
                           'Available'}:</span> {entry.value.toFixed(1)}
                  </p>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return null;
};

const RoleCapacityChart = ({ startDate, endDate, weeks, onDataChange }: RoleCapacityChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const [activeRoles, setActiveRoles] = useState<string[]>([roles[0].name, roles[1].name]);
  const prevInputsRef = useRef<string>('');
  
  // Use useMemo to compute a stable key for checking if inputs have changed
  const inputsKey = useMemo(() => {
    return JSON.stringify({
      startDate: startDate.toISOString(),
      weeks
    });
  }, [startDate, weeks]);
  
  // Generate data only when inputs change
  useEffect(() => {
    // Only regenerate data if something important changed
    if (prevInputsRef.current !== inputsKey) {
      const newData = generateRoleCapacityData(startDate, weeks);
      setData(newData);
      prevInputsRef.current = inputsKey;
      
      // Call the onDataChange callback if provided
      if (onDataChange) {
        onDataChange(newData);
      }
    }
  }, [inputsKey, startDate, weeks, onDataChange]);
  
  const toggleRole = useCallback((roleName: string) => {
    setActiveRoles(prev => 
      prev.includes(roleName) 
        ? prev.filter(r => r !== roleName) 
        : [...prev, roleName]
    );
  }, []);
  
  // Memoize the role buttons to prevent re-renders
  const roleButtons = useMemo(() => (
    <div className="flex flex-wrap gap-2 mb-4">
      {roles.map(role => (
        <button
          key={role.id}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            activeRoles.includes(role.name)
              ? `bg-[${role.color}] text-[#FAFDFF]`
              : 'bg-[#222222] text-gray-400 hover:bg-[#333333]'
          }`}
          onClick={() => toggleRole(role.name)}
        >
          {role.name}
        </button>
      ))}
    </div>
  ), [activeRoles, toggleRole]);
  
  // Memoize the chart content to prevent re-renders
  const chartContent = useMemo(() => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: "#FAFDFF" }}
          tickLine={false}
          stroke="#333333"
        />
        <YAxis 
          tickLine={false}
          tick={{ fontSize: 12, fill: "#FAFDFF" }}
          stroke="#333333"
          label={{ value: 'FTE', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: "#FAFDFF" } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="top" 
          height={36}
          wrapperStyle={{ fontSize: '12px', color: "#FAFDFF" }}
        />
        
        {roles.filter(role => activeRoles.includes(role.name)).map((role) => (
          <Line
            key={`${role.name}_capacity`}
            type="monotone"
            dataKey={`${role.name}_capacity`}
            name={`${role.name} Capacity`}
            stroke={role.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
        
        {roles.filter(role => activeRoles.includes(role.name)).map((role) => (
          <Line
            key={`${role.name}_planned`}
            type="monotone"
            dataKey={`${role.name}_planned`}
            name={`${role.name} Planned`}
            stroke={role.color}
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  ), [data, activeRoles]);
  
  return (
    <div className="h-full flex flex-col">
      {roleButtons}
      <div className="flex-1">
        {chartContent}
      </div>
    </div>
  );
};

export default RoleCapacityChart;
