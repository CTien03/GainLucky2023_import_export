import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChevronLeft, ArrowRight, Home, Building2, User, Package, Layers } from 'lucide-react';

const FabricExplorer = () => {
  const [sampleData, setSampleData] = useState([]);

  useEffect(() => {
    fetch('/fabric_data_gain_lucky_2023_export_top20.json')
      .then((response) => response.json())
      .then((data) => setSampleData(data))
      .catch((error) => console.error('Error loading data:', error));
  }, []);

  const [currentView, setCurrentView] = useState('brand');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [selectedFabricType, setSelectedFabricType] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  const brands = useMemo(() =>
    [...new Set(sampleData.map(d => d.Brand))].sort(),
    [sampleData]
  );

  const buyers = useMemo(() =>
    selectedBrand ? [...new Set(sampleData
      .filter(d => d.Brand === selectedBrand)
      .map(d => d.Buyer))].sort() : [],
    [sampleData, selectedBrand]
  );

  const fabricTypes = useMemo(() =>
    selectedBrand && selectedBuyer ? [...new Set(sampleData
      .filter(d => d.Brand === selectedBrand && d.Buyer === selectedBuyer)
      .map(d => d.Normalized_fabric))].sort() : [],
    [sampleData, selectedBrand, selectedBuyer]
  );

  const materialData = useMemo(() => {
    if (!selectedBrand || !selectedBuyer || !selectedFabricType) return [];

    const filtered = sampleData.filter(d =>
      d.Brand === selectedBrand &&
      d.Buyer === selectedBuyer &&
      d.Normalized_fabric === selectedFabricType
    );

    const grouped = filtered.reduce((acc, curr) => {
      const material = curr.Fabric_Composition_Normalized;
      if (!acc[material]) {
        acc[material] = 0;
      }
      acc[material] += curr.Quantity;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [sampleData, selectedBrand, selectedBuyer, selectedFabricType]);

  const monthlyPriceData = useMemo(() => {
    if (!selectedMaterial) return [];

    const filtered = sampleData.filter(d =>
      d.Brand === selectedBrand &&
      d.Buyer === selectedBuyer &&
      d.Normalized_fabric === selectedFabricType &&
      d.Fabric_Composition_Normalized === selectedMaterial
    );

    const grouped = filtered.reduce((acc, curr) => {
      if (!acc[curr.Month]) {
        acc[curr.Month] = { total: 0, count: 0 };
      }
      acc[curr.Month].total += curr.UnitPrice_Currency;
      acc[curr.Month].count += 1;
      return acc;
    }, {});

    const data = Object.entries(grouped).map(([month, data]) => ({
      month,
      avgPrice: data.total / data.count
    })).sort((a,b) => a.month.localeCompare(b.month));

    // Find min and max prices
    if (data.length > 0) {
      const prices = data.map(d => d.avgPrice);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return data.map(d => ({
        ...d,
        isHighest: d.avgPrice === maxPrice,
        isLowest: d.avgPrice === minPrice
      }));
    }
    
    return data;
  }, [sampleData, selectedBrand, selectedBuyer, selectedFabricType, selectedMaterial]);

  const dimensionData = useMemo(() => {
    if (!selectedMaterial) return [];

    const filtered = sampleData.filter(d =>
      d.Brand === selectedBrand &&
      d.Buyer === selectedBuyer &&
      d.Normalized_fabric === selectedFabricType &&
      d.Fabric_Composition_Normalized === selectedMaterial
    );

    const grouped = filtered.reduce((acc, curr) => {
      const dim = String(curr.Dimension_Info);
      if (!acc[dim]) {
        acc[dim] = 0;
      }
      acc[dim] += curr.Quantity;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [sampleData, selectedBrand, selectedBuyer, selectedFabricType, selectedMaterial]);

  // Navigation functions
  const goToView = (view) => {
    setCurrentView(view);
    if (view === 'brand') {
      setSelectedBrand('');
      setSelectedBuyer('');
      setSelectedFabricType('');
      setSelectedMaterial('');
    } else if (view === 'buyer') {
      setSelectedBuyer('');
      setSelectedFabricType('');
      setSelectedMaterial('');
    } else if (view === 'fabric') {
      setSelectedFabricType('');
      setSelectedMaterial('');
    } else if (view === 'material') {
      setSelectedMaterial('');
    }
  };

  const goBack = () => {
    if (currentView === 'details') {
      setCurrentView('material');
      setSelectedMaterial('');
    } else if (currentView === 'material') {
      setCurrentView('fabric');
      setSelectedFabricType('');
    } else if (currentView === 'fabric') {
      setCurrentView('buyer');
      setSelectedBuyer('');
    } else if (currentView === 'buyer') {
      setCurrentView('brand');
      setSelectedBrand('');
    }
  };

  const handleMaterialClick = (entry) => {
    setSelectedMaterial(entry.name);
    setCurrentView('details');
  };

  // Custom dot component for the line chart
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isHighest) {
      return <circle cx={cx} cy={cy} r={8} fill="#22c55e" stroke="#16a34a" strokeWidth={3} />;
    } else if (payload.isLowest) {
      return <circle cx={cx} cy={cy} r={8} fill="#ef4444" stroke="#dc2626" strokeWidth={3} />;
    } else {
      return <circle cx={cx} cy={cy} r={6} fill="#8884d8" stroke="#6366f1" strokeWidth={2} />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header with Flow Navigation */}
      <div className="mb-6">
        {/* Flow Navigation Buttons */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => goToView('brand')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
              currentView === 'brand' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <Home size={16} />
            Brands
          </button>

          {selectedBrand && (
            <button
              onClick={() => goToView('buyer')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                currentView === 'buyer' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              <User size={16} />
              Buyers
            </button>
          )}

          {selectedBrand && selectedBuyer && (
            <button
              onClick={() => goToView('fabric')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                currentView === 'fabric' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <Package size={16} />
              Fabric Types
            </button>
          )}

          {selectedBrand && selectedBuyer && selectedFabricType && (
            <button
              onClick={() => goToView('material')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                currentView === 'material' 
                  ? 'border-orange-500 bg-orange-50 text-orange-700' 
                  : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <Layers size={16} />
              Materials
            </button>
          )}

          {selectedMaterial && (
            <button
              onClick={() => goToView('details')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                currentView === 'details' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
              }`}
            >
              <Building2 size={16} />
              Details
            </button>
          )}
        </div>

        {/* Traditional Back Button */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          {currentView !== 'brand' && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <span className="text-gray-400">
            {selectedBrand && `${selectedBrand}`}
            {selectedBuyer && ` > ${selectedBuyer}`}
            {selectedFabricType && ` > ${selectedFabricType}`}
            {selectedMaterial && ` > ${selectedMaterial}`}
          </span>
        </div>

        {/* <h1 className="text-3xl font-bold text-gray-800">
          Interactive Fabric Data Explorer
        </h1> */}
        <p className="text-gray-600 mt-2">
          {/* {currentView === 'brand' && 'Select a brand to start exploring'} */}
          {currentView === 'buyer' && `Buyers for ${selectedBrand}`}
          {currentView === 'fabric' && `Fabric types for ${selectedBrand} > ${selectedBuyer}`}
          {currentView === 'material' && `Material composition for ${selectedFabricType}`}
          {currentView === 'details' && `Detailed analysis for ${selectedMaterial}`}
        </p>
      </div>

      {/* Brand Selection */}
      {currentView === 'brand' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => {
            const totalQuantity = sampleData
              .filter(d => d.Brand === brand)
              .reduce((acc, cur) => acc + cur.Quantity, 0);

            return (
              <button
                key={brand}
                onClick={() => {
                  setSelectedBrand(brand);
                  setCurrentView('buyer');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">{brand}</h3>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500" />
                </div>
                <p className="text-gray-600 mt-2">
                  {totalQuantity.toLocaleString()} quantity
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Buyer Selection */}
      {currentView === 'buyer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyers.map(buyer => {
            const totalQuantity = sampleData
              .filter(d => d.Brand === selectedBrand && d.Buyer === buyer)
              .reduce((acc, cur) => acc + cur.Quantity, 0);

            return (
              <button
                key={buyer}
                onClick={() => {
                  setSelectedBuyer(buyer);
                  setCurrentView('fabric');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">{buyer}</h3>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-green-500" />
                </div>
                <p className="text-gray-600 mt-2">
                  {totalQuantity.toLocaleString()} quantity
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Fabric Type Selection */}
      {currentView === 'fabric' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fabricTypes.map(fabric => {
            const totalQuantity = sampleData
              .filter(d =>
                d.Brand === selectedBrand &&
                d.Buyer === selectedBuyer &&
                d.Normalized_fabric === fabric
              )
              .reduce((acc, cur) => acc + cur.Quantity, 0);

            return (
              <button
                key={fabric}
                onClick={() => {
                  setSelectedFabricType(fabric);
                  setCurrentView('material');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">{fabric}</h3>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-500" />
                </div>
                <p className="text-gray-600 mt-2">
                  {totalQuantity.toLocaleString()} quantity
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Material Composition Pie Chart */}
      {currentView === 'material' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Material Composition Distribution
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <Pie
                data={materialData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                onClick={handleMaterialClick}
                style={{ cursor: 'pointer' }}
              >
                {materialData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Quantity']} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: 12, marginTop: 20 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Material Breakdown */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Material Breakdown
            </h3>
            <div className="space-y-2 text-gray-700">
              {materialData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span
                    className="inline-block w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="flex-1">{item.name}</span>
                  <span className="font-semibold">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis View */}
      {currentView === 'details' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Detailed Analysis: {selectedMaterial}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Price Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Monthly Average Unit Price
              </h3>
              
              {/* Legend for colors */}
              <div className="flex justify-center gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
                  <span>Highest Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
                  <span>Lowest Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-blue-500"></div>
                  <span>Regular</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyPriceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value.toFixed(2)}${props.payload.isHighest ? ' (Highest)' : props.payload.isLowest ? ' (Lowest)' : ''}`, 
                      'Avg Price'
                    ]} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgPrice"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={{ r: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Dimensions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Top 5 Dimensions by Quantity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dimensionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dimensionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Quantity']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricExplorer;