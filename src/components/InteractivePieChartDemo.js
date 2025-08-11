import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const InteractivePieChartDemo = () => {
  const [sampleData, setSampleData] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedClothing, setSelectedClothing] = useState('');
  const [selectedLabelType, setSelectedLabelType] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Load JSON data
  useEffect(() => {
    fetch('/material_summary.json')
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(item => ({
          ...item,
          gender: item.Label_GenderVN // 👈 Fix here
        }));
        setSampleData(normalized);
  
        if (normalized.length > 0) {
          setSelectedMaterial(normalized[0].material);
          setSelectedClothing(normalized[0].clothing);
          setSelectedLabelType(normalized[0].labelType);
        }
      })
      .catch(err => console.error('Failed to load JSON:', err));
  }, []);

  const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137.508) % 360;
      const saturation = 70 + (i % 3) * 10;
      const lightness = 45 + (i % 2) * 15;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const materials = [...new Set(sampleData.map(item => item.material))].sort();
  const clothingTypes = [...new Set(sampleData.map(item => item.clothing))].sort();
  const labelTypes = [...new Set(sampleData.map(item => item.labelType))].sort();

  // Filter and aggregate data based on selections
  useEffect(() => {
    const filteredData = sampleData.filter(item =>
      item.material === selectedMaterial &&
      item.clothing === selectedClothing &&
      item.labelType === selectedLabelType
    );

    if (filteredData.length === 0) {
      setChartData([]);
      setTotalCount(0);
      return;
    }

    const genderCounts = {};
    filteredData.forEach(item => {
      if (genderCounts[item.gender]) {
        genderCounts[item.gender] += item.count;
      } else {
        genderCounts[item.gender] = item.count;
      }
    });

    const total = Object.values(genderCounts).reduce((sum, count) => sum + count, 0);
    setTotalCount(total);

    const processedData = Object.entries(genderCounts).map(([gender, count]) => ({
      name: gender,
      value: count,
      percentage: ((count / total) * 100).toFixed(1)
    }));

    setChartData(processedData);
  }, [selectedMaterial, selectedClothing, selectedLabelType, sampleData]);

  const colors = generateColors(chartData.length);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-blue-600">Count: {data.value}</p>
          <p className="text-green-600">Percentage: {data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Clothing Data: Gender Distribution Analysis Gainlucky 2023
        </h1>
        <p className="text-gray-600">
          Analyze gender distribution across material composition, clothing type, and manufacturing method
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Material Composition</label>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm"
          >
            {materials.map(material => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Clothing Type</label>
          <select
            value={selectedClothing}
            onChange={(e) => setSelectedClothing(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm"
          >
            {clothingTypes.map(clothing => (
              <option key={clothing} value={clothing}>{clothing}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Manufacturing Type</label>
          <select
            value={selectedLabelType}
            onChange={(e) => setSelectedLabelType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm"
          >
            {labelTypes.map(labelType => (
              <option key={labelType} value={labelType}>{labelType}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gender Distribution</h2>
          <p className="text-sm text-gray-600">
            Material: <span className="font-medium text-blue-600">{selectedMaterial}</span> | 
            Clothing: <span className="font-medium text-green-600">{selectedClothing}</span> | 
            Type: <span className="font-medium text-purple-600">{selectedLabelType}</span>
          </p>
          {totalCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">Total samples: {totalCount}</p>
          )}
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data found for the selected combination.
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractivePieChartDemo;
