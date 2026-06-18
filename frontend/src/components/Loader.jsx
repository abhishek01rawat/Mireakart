import React from 'react';

const Loader = ({ size = 'md', text }) => {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '60px',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '12px'
    }}>
      <div className="spinner" style={{ width: sizeMap[size], height: sizeMap[size] }} />
      {text && <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );
};

export default Loader;
