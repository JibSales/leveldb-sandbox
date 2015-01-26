# LevelDB Sandbox
> A playground to experiment with building LevelDB datastores using node.js

## Setup
Run the following:

    $ npm install
    $ npm start

## Notes
This is an overly simplified solution to building queries with LevelDB. Currently the find method is hardcoded to the exact query I'm trying to perform. Though it wouldn't be terribly painful to just hardcode each query our app will perform (think CouchDB 'views'), we would want to develop a more robust Query API to allow for dynamic, on the fly lookups.

Eugene Ware is creating a MongoDB like API here: https://github.com/eugeneware/jsonquery-engine
Mikeal Rogers created a CouchDB clone here: https://github.com/mikeal/couchup