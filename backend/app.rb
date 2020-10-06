require 'sinatra'
require 'json'
require 'neo4j'
require 'neo4j-core'
require 'byebug'

neo4j_url = ENV['NEO4J_URL'] || 'http://localhost:7474'
neo4j_username = ENV['NEO4J_USERNAME'] || 'neo4j'
neo4j_password = ENV['NEO4J_PASSWORD'] || 'test'

Neo4j::Session.open(
  :server_db, neo4j_url,
  basic_auth: {username: neo4j_username, password: neo4j_password}
)

class Movie
  include Neo4j::ActiveNode

  property :title, type: String
  property :released, type: Integer
  property :tagline, type: String
end

class Person
  include Neo4j::ActiveNode

  property :name, type: String
  property :born, type: Integer

  has_many :out, :movies, type: :ACTED_IN, rel_class: ActedIn
  has_many :out, :movies, type: :DIRECTED
  has_many :out, :movies, type: :PRODUCED
end

class ActedIn
  include ActiveGraph::Relationship

  from_class :Person
  to_class   :Movie

  property :roles

  serialize :roles
end


before do
  content_type :json
end

get '/movies' do
  movies = Movie.all # .with_associations(:author, :categories)

  movies.to_json
end
