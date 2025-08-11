import React from "react";
import { Link } from "react-router-dom";

// import_data_vai_quan_ao
import GainLucky2023VaiImport from "../components/GainLucky2023_vai_import";
import GainLucky2023ClothingImport from "../components/GainLucky2023_clothing_import";

// export_data_vai_quan_ao
import GainLucky2023VaiExport from "../components/GainLucky2023_vai_export";
import HierarchicalDataExplorer from "../components/HierarchicalDataExplorer";

function TrangDuong() {
  return (
    <div className="chart-page" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        GainLucky 2023 - Import & Export Charts
      </h1>

      {/* IMPORT SECTION */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px", marginBottom: "20px" }}>
          Import Data
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#fff" }}>
            <h3 style={{ textAlign: "center" }}>Fabric Data Import</h3>
            <GainLucky2023VaiImport />
          </div>
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#fff" }}>
            <h3 style={{ textAlign: "center" }}>Clothing Data Import</h3>
            <GainLucky2023ClothingImport />
          </div>
        </div>
      </section>

      {/* EXPORT SECTION */}
      <section>
        <h2 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px", marginBottom: "20px" }}>
          Export Data
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#fff" }}>
            <h3 style={{ textAlign: "center" }}>Fabric Data Export</h3>
            <GainLucky2023VaiExport />
          </div>
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#fff" }}>
            <h3 style={{ textAlign: "center" }}>Clothing Data Export</h3>
            <HierarchicalDataExplorer />
          </div>
        </div>
      </section>

      {/* Link quay về */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to="/"
          className="back-link"
          style={{
            textDecoration: "none",
            color: "#007bff",
            fontWeight: "bold",
          }}
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default TrangDuong;