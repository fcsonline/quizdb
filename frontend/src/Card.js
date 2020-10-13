import React from 'react';

import './Card.css';

function Card({ title }) {

  return (
    <div className="Card">
      {title}
    </div>
  );
}

export default Card;
