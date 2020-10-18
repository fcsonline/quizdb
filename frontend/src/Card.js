import React from 'react';

import './Card.css';

function Card({ title, options, onClickOption }) {
  return (
    <div className='Card'>
      <div className='Question'>
        {title}
      </div>

      <div className='Options'>
        {options.map((option) => (
          <button key={option} className='Option' onClick={onClickOption(option)}>
            { option }
          </button>
        ))}
      </div>
    </div>
  );
}

export default Card;
