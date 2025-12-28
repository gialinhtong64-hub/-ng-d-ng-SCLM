import React from "react";
import "./PhoneFrame.css";

interface PhoneFrameProps {
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, bottomNav }) => {
  return (
    <div className="phone-frame">
      <div className="app-content">
        {children}
      </div>
      {bottomNav && (
        <div className="phone-bottom-nav">
          {bottomNav}
        </div>
      )}
    </div>
  );
};

export default PhoneFrame;
