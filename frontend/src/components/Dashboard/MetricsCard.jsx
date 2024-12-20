import React from "react";
import { AiOutlineWarning } from "react-icons/ai";
import { BsBox } from "react-icons/bs";
import { FiUsers, FiClipboard } from "react-icons/fi";


const MetricsCard = ({ title, value, color, icon }) => {
  // Diccionario para los íconos
  const iconComponents = {
    warning: <AiOutlineWarning className="icon" style={{ color: "#dc3545" }} />,
    box: <BsBox className="icon" style={{ color: "#007bff" }} />,
    users: <FiUsers className="icon" style={{ color: "#28a745" }} />,
    clipboard: <FiClipboard className="icon" style={{ color: "#ffc107" }} />,
  };

  return (
    <div className={`metrics-card metrics-card-${color}`}>
      {iconComponents[icon]}
      <h3 className="metrics-card-title">{title}</h3>
      <p className="metrics-card-value">{value}</p>
    </div>
  );
};

export default MetricsCard;
