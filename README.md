# QuizDB

_A personal dynamic flash cards_

QuizDb is a really small flashcards games based in a graphical database that you setup.
The goal of this game is to improve the capabilities and the playability of
flashcards (Anki cards) adding more dynamism to the questions you get instead of a rigid set of them.

As a side project, the goal was to play with different technologies like Neo4j databases or docker-compose.

As MVP, the Neo4j dataset used in this project is a demo one, related with Hollywood movies and actors,
that comes by default with the Neo4j installation.

## Setup

```
docker-compose up
```

Go to http://localhost:7474/browser/browser/ and run:

```
play :movies
```

After load the movies, you should have something like this in your neo4j
database:

![](./docs/movies.png)

## Play

Go to http://localhost:3000 and start answering questions!

## Screenshots

![](./docs/questions.png)

## Project goals

Right now, there are only two types of questions about movies in this MVP but
the long term goal is to bundle (datasets + dynamic questions) and share it
with other people. They can be datasets about whatever topic. It
can be books, authors, movies, etc.

## Documentation

- https://neo4jrb.readthedocs.io/en/stable/
