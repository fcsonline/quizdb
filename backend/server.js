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

const { questions } = require('./bundles/questions')

app.use(bodyParser.json())

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

app.get('/api/ping', function (req, res) {
  res.json('Ok!')
})

app.get('/api/ask', async (req, res) => {
  const id = uuidv4()

  const challange = _.sample(questions)
  const { question, options, answer } = await challange(session)

  // Store it in Redis to retrieve it later
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

app.post('/api/answer', async (req, res) => {
  console.log('Incoming answer', req.body)

  const id = req.body.id
  const answer = String(req.body.answer)

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

process.on('SIGTERM', async () => {
  debug('SIGTERM signal received: closing HTTP server')

  await driver.close()

  app.close(() => {
    debug('HTTP server closed')
  })
})
