import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const dimensionColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

const markerShapes = {
  circle: '●',
  triangle: '▲',
  square: '■',
  diamond: '◆',
  star: '★',
  invertedTriangle: '▼'
};

const getShapeByFabric = (fabricType) => {
  const types = Object.keys(markerShapes);
  let hash = 0;
  for (let i = 0; i < fabricType.length; i++) {
    hash = fabricType.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % types.length;
  return types[index];
};


const getColorByDimension = (dimension, allDimensions) => {
  const index = allDimensions.indexOf(dimension);
  return dimensionColors[index % dimensionColors.length];
};

const SimplifiedFabricChart = () => {
  const [sampleData, setSampleData] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [chartData, setChartData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    fetch('/fabric_data_gain_lucky_2023_import_top30.json')
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(item => ({
          supplier: item.suppliers?.trim() || '',
          material: item.materials?.trim() || '',
          fabricType: item.fabricTypes?.trim() || '',
          dimensionInfo: item.dimension?.trim() || '',
          month: item.months?.trim() || '',
          unitPrice: parseFloat(item.unitPrice_currency) || 0,
          day: item.TradeDate?.trim() || ''
        }));

        setSampleData(normalized);
        if (normalized.length > 0) {
          setSelectedSupplier(normalized[0].supplier);
          setSelectedMaterial(normalized[0].material);
        }
      })
      .catch(err => {
        console.error("Error loading fabric data:", err);
      });
  }, []);

  useEffect(() => {
    const filtered = sampleData.filter(item =>
      item.supplier === selectedSupplier &&
      item.material === selectedMaterial
    );

    const monthlyMap = {};
    filtered.forEach(item => {
      if (!monthlyMap[item.month]) monthlyMap[item.month] = [];
      monthlyMap[item.month].push(item);
    });

    const monthlyAvg = Object.entries(monthlyMap).map(([month, records]) => {
      const avg = records.reduce((sum, r) => sum + r.unitPrice, 0) / records.length;
      return { month, averagePrice: parseFloat(avg.toFixed(2)) };
    }).sort((a, b) => a.month.localeCompare(b.month));

    setChartData(monthlyAvg);
    setHasData(filtered.length > 0);

    if (selectedMonth) {
      const daily = monthlyMap[selectedMonth]?.map(item => ({
        date: item.day,
        unitPrice: item.unitPrice,
        dimensionInfo: item.dimensionInfo,
        fabricType: item.fabricType
      })) || [];

      setDailyData(daily);
    }
  }, [sampleData, selectedSupplier, selectedMaterial, selectedMonth]);

  const handleChartClick = (event) => {
    const label = event?.activeLabel;
    if (label) {
      setSelectedMonth(label);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">Month: {label}</p>
          <p className="text-blue-600">Average Price: ${data.averagePrice}</p>
          <p className="text-xs text-gray-500">Click to view daily data</p>
        </div>
      );
    }
    return null;
  };

  const DailyScatterPlot = () => {
    const dimensions = [...new Set(dailyData.map(d => d.dimensionInfo))];
    const fabricTypes = [...new Set(dailyData.map(d => d.fabricType))];

    const width = 880;
    const height = 420;
    const margin = { top: 20, right: 180, bottom: 100, left: 60 };

    const dates = [...new Set(dailyData.map(d => d.date))].sort();
    const prices = dailyData.map(d => d.unitPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    return (
      <svg width={width} height={height} className="border border-gray-300 mt-8">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g>
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#666" />
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#666" />

          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const price = minPrice + ratio * priceRange;
            const y = margin.top + (1 - ratio) * (height - margin.top - margin.bottom);
            return (
              <g key={ratio}>
                <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#333" />
                <text x={margin.left - 10} y={y + 4} fontSize="10" textAnchor="end">{price.toFixed(1)}</text>
              </g>
            );
          })}

          {dates.map((date, i) => {
            const x = margin.left + (i * (width - margin.left - margin.right)) / (dates.length - 1 || 1);
            return (
              <text
                key={date}
                x={x}
                y={height - margin.bottom + 35}
                fontSize="10"
                textAnchor="middle"
                transform={`rotate(-45, ${x}, ${height - margin.bottom + 35})`}
              >
                {date}
              </text>
            );
          })}

          {dailyData.map((point, i) => {
            const x = margin.left + (dates.indexOf(point.date) * (width - margin.left - margin.right)) / (dates.length - 1 || 1);
            const y = margin.top + (1 - (point.unitPrice - minPrice) / priceRange) * (height - margin.top - margin.bottom);
            const color = getColorByDimension(point.dimensionInfo, dimensions);
            const shape = getShapeByFabric(point.fabricType);

            if (shape === 'triangle') {
              return <path key={i} d={`M${x},${y - 6} L${x - 6},${y + 6} L${x + 6},${y + 6} Z`} fill={color} stroke="#333" strokeWidth={1} />;
            } else if (shape === 'square') {
              return <rect key={i} x={x - 5} y={y - 5} width={10} height={10} fill={color} stroke="#333" strokeWidth={1} />;
            } else if (shape === 'diamond') {
              return <polygon key={i} points={`${x},${y - 6} ${x + 6},${y} ${x},${y + 6} ${x - 6},${y}`} fill={color} stroke="#333" strokeWidth={1} />;
            } else if (shape === 'star') {
              return (
                <text key={i} x={x} y={y + 5} textAnchor="middle" fontSize="14" fill={color} stroke="#333" strokeWidth={0.5}>
                  ★
                </text>
              );
            } else if (shape === 'invertedTriangle') {
              return <path key={i} d={`M${x},${y + 6} L${x - 6},${y - 6} L${x + 6},${y - 6} Z`} fill={color} stroke="#333" strokeWidth={1} />;
            } else {
              return <circle key={i} cx={x} cy={y} r={5} fill={color} stroke="#333" strokeWidth={1} />;
            }
          })}
        </g>

        <g transform={`translate(${width - margin.right + 30}, ${margin.top})`}>
          <text fontSize="12" fontWeight="bold">Dimensions (Colors)</text>
          {dimensions.map((d, i) => (
            <g key={d} transform={`translate(0, ${(i + 1) * 20})`}>
              <circle cx={5} cy={5} r={5} fill={dimensionColors[i % dimensionColors.length]} stroke="#333" strokeWidth={1} />
              <text x={15} y={9} fontSize="10">{d}</text>
            </g>
          ))}

          <text y={(dimensions.length + 2) * 20} fontSize="12" fontWeight="bold">Cloth Types (Markers)</text>
          {fabricTypes.map((f, i) => {
            const shape = getShapeByFabric(f);
            const y = (dimensions.length + 3 + i) * 20;
            return (
              <g key={f} transform={`translate(0, ${y})`}>
                <text x={0} y={9} fontSize="16">{markerShapes[shape]}</text>
                <text x={20} y={9} fontSize="10">{f}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Fabric Price Trend (Monthly & Daily Drilldown)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            {[...new Set(sampleData.map(item => item.supplier))].sort().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Material Composition</label>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            {[...new Set(sampleData.map(item => item.material))].sort().map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {hasData && (
        <div className="bg-white rounded-lg p-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis stroke="#666" label={{ value: 'Average Unit Price ($)', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }} />

              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="averagePrice" stroke="#2563eb" strokeWidth={3} dot={{ r: 8 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>

          {selectedMonth && dailyData.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 text-center mb-2">
                Daily Data for {selectedMonth}
              </h2>
              <DailyScatterPlot />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimplifiedFabricChart;
