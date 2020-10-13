import React from 'react';
import Card from './Card';
import './App.css';

function App() {
  const [game, setGame] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/ask')
      .then(response => response.json())
      .then(game => setGame(game))
  })

  return (
    <div className="App">
      {!game && <p>Loading...</p>}
      {game && <Card title={game.question} /> }
    </div>
  );
}

export default App;
