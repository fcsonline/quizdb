import React from 'react';
import Card from './Card';
import axios from 'axios';
import './App.css';

function App() {
  const [game, setGame] = React.useState(null);

  React.useEffect(() => {
    async function fetchData () {
      const { data } = await axios.get('/api/ask')

      setGame(data)
    }

    fetchData();
  }, [])

  const onClickOption = (event) => {
    event.stopPropagation()
  }

  return (
    <div className="App">
      {!game && <p>Loading...</p>}
      {game && <Card title={game.question} onClickOption={onClickOption} /> }
    </div>
  );
}

export default App;
