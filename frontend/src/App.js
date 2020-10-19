import React from 'react';
import Card from './Card';
import axios from 'axios';
import { useMachine } from '@xstate/react';
import { Machine } from 'xstate';

import './App.css';

const toggleMachine = Machine({
  id: 'toggle',
  initial: 'loading',
  states: {
    loading: {
      on: { LOADED: 'active' }
    },
    active: {
      on: {
        CORRECT: 'correct',
        INCORRECT: 'incorrect',
      }
    },
    correct: {
      on: { LOADING: 'loading' }
    },
    incorrect: {
      on: { LOADING: 'loading' }
    }
  }
});

function App() {
  const [game, setGame] = React.useState(null);
  const [state, send] = useMachine(toggleMachine);

  const fetchData = React.useCallback(async () => {
    send('LOADING')
    const { data } = await axios.get('/api/ask')

    // A bit of suspense
    await new Promise(r => setTimeout(r, 1000));

    setGame(data)
    send('LOADED')
  }, [setGame, send])

  React.useEffect(() => {
    fetchData();
  }, [fetchData])

  const onClickOption = (option) => {
    return async (event) => {
      event.stopPropagation()

      const { data } = await axios.post('/api/answer', {
        id: game.id,
        answer: option
      })

      if (data.answer === 'correct') {
        send('CORRECT')
      } else {
        send('INCORRECT')
      }

      setTimeout(() => {
        fetchData()
      }, 2000)
    }
  }

  return (
    <div className="App">
      {state.value === 'loading' && (
        <div className='Loading'>
          <img src='/loading.svg' width="100" alt='Loading' />
        </div>
      )}

      {state.value === 'active' && (
        <Card
          title={game.question}
          options={game.options}
          onClickOption={onClickOption}
        />
      )}

      {state.value === 'correct' && (
        <div className="Result">
          <div className="Wrapper">
            <svg className="Badge correct" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
          </div>
          <p className="Description correct">Correct!</p>
        </div>
      )}

      {state.value === 'incorrect' && (
        <div className="Result">
          <div className="Wrapper">
            <svg className="Badge incorrect" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="Description incorrect">Incorrect!</p>
        </div>
      )}
    </div>
  );
}

export default App;
