const redis = require("redis")
const neo4j = require('neo4j-driver')
const { v4: uuidv4 } = require('uuid')
const _ = require('lodash')

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000

const uri = 'bolt://database:7687'
const user = 'neo4j'
const password = 'test'
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

const client = redis.createClient(process.env.REDIS_URL)

app.use(bodyParser.json())

const challenges = [
  async () => {
    const actors = await session.run ('MATCH (p: Person) RETURN p.name')
    const actor = _.sample(actors.records).get(0)
    const movies = await session.run ('MATCH (Person {name: $actor})-[:ACTED_IN]->(actorMovies) RETURN actorMovies', { actor })

    if (!movies.records.length) throw new Error(`No movie records for ${actor}`)

    const movie = _.sample(movies.records).get(0).properties

    let options = await session.run ('MATCH (movie:Movie) RETURN movie.title LIMIT 15')

    if (!options.records.length) throw new Error('No option records')

    options = _.sampleSize(options.records.map(record => record.get(0)), 3)

    if (!options.includes(movie.title)) {
      options = [
        ..._.sampleSize(options, 2),
        movie.title
      ]
    }

    return {
      question: `In which movie acted ${actor} in and was released on ${movie.released.low}?`,
      options: _.shuffle(options),
      answer: movie.title
    }
  }
]

app.get('/api/ping', function (req, res) {
  res.json('Ok!')
})

app.get('/api/ask', async (req, res) => {
  const id = uuidv4()

  const challange = _.sample(challenges)
  const { question, options, answer } = await challange()

  client.hmset(`game-${id}`, {
    question,
    answer
  })

  console.log('Q:', question)
  console.log('A:', answer, `(${options.join(', ')})`)

  res.json({
    id,
    question,
    options
  })
})

function fetchGame(id) {
  return new Promise((resolve, reject) => {
    client.hgetall(`game-${id}`, (err, reply) => {
      if (err) {
        reject(err)
      } else {
        resolve(reply)
      }
    })
  })
}

app.post('/api/answer', async (req, res) => {
  console.log('Incoming answer', req.body)

  const id = req.body.id
  const answer = req.body.answer

  const game = await fetchGame(id)

  console.log('Game', game)

  if (!game) {
    res.status(404)
  } else if (game.answer !== answer) {
    res.json({ answer: 'incorrect' })
  } else {
    res.json({ answer: 'correct' })
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// await driver.close()
