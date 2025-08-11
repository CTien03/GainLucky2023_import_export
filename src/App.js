import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TrangChinh from "./pages/TrangChinh";
import TrangBieuDo from "./pages/TrangBieuDo";
import TrangDuong from "./pages/TrangDuong";
import './styles/global.css';
import './styles/charts.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrangChinh />} />
        <Route path="/gender-analysis" element={<TrangBieuDo />} />
        <Route path="/trend-analysis" element={<TrangDuong />} />
      </Routes>
    </Router>
  );
}

export default App;
