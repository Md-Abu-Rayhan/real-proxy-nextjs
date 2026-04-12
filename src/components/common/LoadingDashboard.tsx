"use client";

import React from "react";

const LoadingDashboard = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <svg 
          className="svg-spinner" 
          viewBox="0 0 50 50"
        >
          <circle 
            className="path" 
            cx="25" 
            cy="25" 
            r="20" 
            fill="none" 
            strokeWidth="5"
          ></circle>
        </svg>
        <span className="loader-text">Loading Dashboard...</span>
      </div>

      <style jsx>{`
        .loader-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 400px;
          background: transparent;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .svg-spinner {
          animation: rotate 2s linear infinite;
          width: 50px;
          height: 50px;
        }

        .svg-spinner .path {
          stroke: #0086ff;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        .loader-text {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingDashboard;
