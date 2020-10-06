require 'sinatra'
require 'json'
# require 'active_graph'
# require 'neo4j-ruby-driver'
require 'byebug'

byebug

ActiveGraph::Base.driver = Neo4j::Driver::GraphDatabase.driver(
  'neo4j::/localhost:7687',
  Neo4j::Driver.AuthTokens.basic('neo4j','test'),
  encryption: false
)

me = ActiveGraph::Base.query('MATCH (found:User) WHERE found.name = {aName} RETURN found', aName: 'Andreas').first.found

class Movie
  include ActiveGraph::Node

  property :title, type: String
  property :released, type: Integer
  property :tagline, type: String
end

class Person
  include ActiveGraph::Node

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
