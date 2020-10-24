const _ = require('lodash')

const questions = [
  async (session) => {
    const actors = await session.run ('MATCH (p: Person)-[:ACTED_IN]->(m) RETURN p.name')
    const actor = _.sample(actors.records).get(0)
    const movies = await session.run ('MATCH (Person {name: $actor})-[:ACTED_IN]->(actorMovies) RETURN actorMovies', { actor })

    if (!movies.records.length) throw new Error(`No movie records for ${actor}`)

    const movie = _.sample(movies.records).get(0).properties

    let options = await session.run ('MATCH (movie:Movie) RETURN movie.title LIMIT 50')

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
  },
  async (session) => {
    const movies = await session.run ('MATCH (movie:Movie) RETURN movie LIMIT 100')

    if (!movies.records.length) throw new Error(`No movie records`)

    const movie = _.sample(movies.records).get(0).properties

    let options = _.sampleSize(_.uniq(movies.records.map(record => record.get(0).properties.released.low)), 3)

    const year = movie.released.low

    if (!options.includes(year)) {
      options = [
        ..._.sampleSize(options, 2),
        year
      ]
    }

    return {
      question: `In which year was '${movie.title}' released?`,
      options: _.shuffle(options),
      answer: String(year)
    }
  }
]

module.exports = {
  questions
}
