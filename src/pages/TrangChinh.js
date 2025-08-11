import React from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";
// import logo from "./src/logo070825.png"; // dùng logo mặc định từ Create React App hoặc logo của bạn

function TrangChinh() {
  return (
    <div className="home-container">
      <div className="home-content animate-fade-in">
        {/* <img src={logo} alt="App Logo" className="home-logo bounce" /> */}

        <h1 className="home-title slide-in"> Top 20 Material Analytics GainLucky 2023 Import-Export</h1>
        {/* <p className="home-subtitle fade-in">
          Phân tích dữ liệu vật liệu trong ngành thời trang GainLucky 2023
        </p> */}

        <div className="home-buttons">
          {/* <Link to="/gender-analysis" className="home-button primary">
            🔍 Phân tích giới tính
          </Link> */}
          <Link to="/trend-analysis" className="home-button secondary">
            📈 Phân tích xu hướng
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TrangChinh;
