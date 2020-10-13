import React from 'react';

import './Card.css';

function Card({ title, onClickOption }) {

  return (
    <div className="Card">
      {title}
      <button onClick={onClickOption}>
        Option1
      </button>
      <button onClick={onClickOption}>
        Option1
      </button>
    </div>
  );
}

export default Card;
