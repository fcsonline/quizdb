const neo4j = require('neo4j-driver')
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash')

const express = require('express')
const app = express()
const port = 3000

const uri = 'bolt://database:7687'
const user = 'neo4j'
const password = 'test'
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

const games = {}

const challanges = [
  async () => {
    const actors = await session.run ('MATCH (p: Person) RETURN p.name')
    const actor = _.sample(actors.records).get(0)
    const movies = await session.run ('MATCH (Person {name: $actor})-[:ACTED_IN]->(actorMovies) RETURN actorMovies', { actor })

    if (!movies.records.length) throw new Error('No records')

    const movie = _.sample(movies.records).get(0).properties

    return { question: `In which movie acted ${actor} in and was released on ${movie.released.low}?`, answer: movie.title }
  }
]


app.get('/ask', async (req, res) => {
  const id = uuidv4()

  const challange = _.sample(challanges)
  const { question, answer } = await challange()

  games[id] = {
    question,
    answer
  }

  console.log('Q:', question)
  console.log('A:', answer)

  res.json({
    id,
    question
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// await driver.close()
