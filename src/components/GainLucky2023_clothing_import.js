import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from "recharts";
import { Home, User, Package, Layers, ChevronLeft, ChevronRight } from "lucide-react";

const GainLucky2023_clothing_import = () => {
  const [sampleData, setSampleData] = useState([]);
  const [currentLevel, setCurrentLevel] = useState("brand");
  const [selectedPath, setSelectedPath] = useState({});
  const [chartData, setChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);

  const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300",
    "#00ff00", "#ff00ff", "#00ffff", "#ff0000"
  ];

  useEffect(() => {
    fetch("clothing_data_gain_lucky_2023_import_top20.json")
      .then((res) => res.json())
      .then((data) => setSampleData(data))
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const getGroupField = useCallback(() => {
    switch (currentLevel) {
      case "brand": return "brands";
      case "supplier": return "supplier";
      case "fabric_type": return "label_fabric";
      case "product": return "fabricTypes";
      case "percent_material": return "percent_material";
      default: return "brands";
    }
  }, [currentLevel]);

  const processData = useCallback(() => {
    let filteredData = [...sampleData];
    if (selectedPath.brand) {
      filteredData = filteredData.filter(item => item.brands === selectedPath.brand);
    }
    if (selectedPath.supplier) {
      filteredData = filteredData.filter(item => item.supplier === selectedPath.supplier);
    }
    if (selectedPath.fabric_type) {
      filteredData = filteredData.filter(item => item.label_fabric === selectedPath.fabric_type);
    }
    if (selectedPath.product) {
      filteredData = filteredData.filter(item => item.fabricTypes === selectedPath.product);
    }
    if (selectedPath.percent_material) {
      filteredData = filteredData.filter(item => item.percent_material === selectedPath.percent_material);
    }

    if (currentLevel === 'monthly_trends') {
      const monthlyData = {};
      filteredData.forEach(item => {
        const month = new Date(item.TradeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += item.unitPrice_currency;
        monthlyData[month].count += 1;
      });

      const lineData = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          avgPrice: parseFloat((data.total / data.count).toFixed(2))
        }))
        .sort((a, b) => new Date(a.month) - new Date(b.month));

      // Find min and max values
      if (lineData.length > 0) {
        const prices = lineData.map(d => d.avgPrice);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Add flags for min/max
        lineData.forEach(d => {
          d.isHighest = d.avgPrice === maxPrice;
          d.isLowest = d.avgPrice === minPrice;
        });
      }

      setLineChartData(lineData);
    } else {
      const groupField = getGroupField();
      const groups = {};

      filteredData.forEach(item => {
        const key = item[groupField];
        if (!groups[key]) {
          groups[key] = 0;
        }
        groups[key] += item.quantity;
      });

      const buttonData = Object.entries(groups).map(([name, quantity]) => ({
        name,
        quantity
      }));

      setChartData(buttonData);
    }
  }, [currentLevel, selectedPath, sampleData, getGroupField]);

  useEffect(() => {
    processData();
  }, [processData]);

  const handleSelection = (selectedItem) => {
    const newPath = { ...selectedPath };
    const newBreadcrumb = [...breadcrumb];

    switch (currentLevel) {
      case "brand":
        newPath.brand = selectedItem;
        newBreadcrumb.push({ level: "brand", value: selectedItem });
        setCurrentLevel("supplier");
        break;
      case "supplier":
        newPath.supplier = selectedItem;
        newBreadcrumb.push({ level: "supplier", value: selectedItem });
        setCurrentLevel("fabric_type");
        break;
      case "fabric_type":
        newPath.fabric_type = selectedItem;
        newBreadcrumb.push({ level: "fabric_type", value: selectedItem });
        setCurrentLevel("product");
        break;
      case "product":
        newPath.product = selectedItem;
        newBreadcrumb.push({ level: "product", value: selectedItem });
        setCurrentLevel("percent_material");
        break;
      case "percent_material":
        newPath.percent_material = selectedItem;
        newBreadcrumb.push({ level: "percent_material", value: selectedItem });
        setCurrentLevel("monthly_trends");
        break;
      default:
        break;
    }

    setSelectedPath(newPath);
    setBreadcrumb(newBreadcrumb);
  };

  const handlePieClick = (data) => {
    if (data && data.name) {
      handleSelection(data.name);
    }
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);

    const newPath = {};
    newBreadcrumb.forEach(item => {
      newPath[item.level] = item.value;
    });
    setSelectedPath(newPath);

    const levels = ["brand", "supplier", "fabric_type", "product", "percent_material", "monthly_trends"];
    setCurrentLevel(levels[index + 1] || "brand");
  };

  const resetToStart = () => {
    setCurrentLevel("brand");
    setSelectedPath({});
    setBreadcrumb([]);
    setChartData([]);
    setLineChartData([]);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">

      {/* Navigation Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => resetToStart()}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
            currentLevel === "brand"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <Home size={16} /> Brands
        </button>
        {selectedPath.brand && (
          <button
            onClick={() => setCurrentLevel("supplier")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
              currentLevel === "supplier"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-300 hover:border-green-400 hover:bg-green-50"
            }`}
          >
            <User size={16} /> Suppliers
          </button>
        )}
        {selectedPath.supplier && (
          <button
            onClick={() => setCurrentLevel("fabric_type")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
              currentLevel === "fabric_type"
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            }`}
          >
            <Package size={16} /> Fabric Types
          </button>
        )}
        {selectedPath.fabric_type && (
          <button
            onClick={() => setCurrentLevel("product")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${
              currentLevel === "product"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
            }`}
          >
            <Layers size={16} /> Materials
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => handleBreadcrumbClick(breadcrumb.length - 2)}
            className="flex items-center gap-1 px-2 py-1 border rounded"
          >
            <ChevronLeft size={14} /> Back
          </button>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="px-2 py-1 border rounded"
              >
                {item.value}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Grid or Charts */}
      {["brand", "supplier", "fabric_type", "product"].includes(currentLevel) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chartData.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelection(item.name)}
              className="p-4 border rounded hover:shadow-lg text-left"
            >
              <div className="font-bold">{item.name}</div>
              <div className="text-sm text-gray-500">{item.quantity.toLocaleString()} quantity</div>
            </button>
          ))}
        </div>
      )}

      {currentLevel === "percent_material" && (
        <>
          <h2 className="text-xl font-bold mt-6">Material composition for {selectedPath.product}</h2>
          <h3 className="text-lg font-bold mt-2">Material Composition by Quantity</h3>
          <p className="text-sm mb-4">Click on a section to view detailed analysis</p>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="40%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                dataKey="quantity"
                onClick={handlePieClick}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  // paddingTop: 10, // khoảng cách nhẹ phía trên legend
                  fontSize: 12,
                  // whiteSpace: 'nowrap',
                }}
              />
            </PieChart>
          </ResponsiveContainer>


        </>
      )}

      {currentLevel === "monthly_trends" && (
        <>
          <h2 className="text-xl font-bold mb-4">Monthly Average Unit Price Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={lineChartData}
              margin={{ top: 50, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => {
                  // Ensure value is a number before calling toFixed
                  const numValue = typeof value === 'number' ? value : parseFloat(value);
                  if (isNaN(numValue)) return ['Invalid value', 'Avg Price'];
                  
                  const formattedValue = numValue.toFixed(2);
                  const suffix = props.payload?.isHighest ? ' (Highest)' : 
                                props.payload?.isLowest ? ' (Lowest)' : '';
                  
                  return [`$${formattedValue}${suffix}`, 'Avg Price'];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgPrice" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  let color = "#8884d8"; // default blue
                  if (payload.isHighest) color = "#22c55e"; // green for max
                  if (payload.isLowest) color = "#ef4444"; // red for min
                  
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={6} 
                      fill={color} 
                      stroke={color} 
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};
export default GainLucky2023_clothing_import;
