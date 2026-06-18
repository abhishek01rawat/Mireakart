import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ value, text, color = '#FFC107' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<FaStar key={i} style={{ color }} />);
    } else if (value >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} style={{ color }} />);
    } else {
      stars.push(<FaRegStar key={i} style={{ color }} />);
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
      <div style={{ display: 'inline-flex', gap: '2px' }}>{stars}</div>
      {text && <span style={{ marginLeft: '5px', color: 'var(--text-secondary)' }}>{text}</span>}
    </div>
  );
};

export default StarRating;
