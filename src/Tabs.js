
import React, { useState } from 'react';
import './Tabs.css';

function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(children[0].props.label);

  const handleClick = (e, newActiveTab) => {
    e.preventDefault();
    setActiveTab(newActiveTab);
  };

  return (
    <div>
      <ul className="tabs">
        {children.map(child => (
          <li
            key={child.props.label}
            className={activeTab === child.props.label ? 'active' : ''}
            onClick={e => handleClick(e, child.props.label)}
          >
            {child.props.label}
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {children.map(child => (
          <div 
            key={child.props.label}
            className={child.props.label === activeTab ? 'tab-pane active' : 'tab-pane'}
          >
            {child.props.children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tabs;
