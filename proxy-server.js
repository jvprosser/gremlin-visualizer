const express = require('express');
const bodyParser = require('body-parser');
const gremlin = require('gremlin');
const cors = require('cors');
const app = express();
const port = 3001;

const fs = require('fs');
const path = require('path');

// Define the path to your log file
const logFilePath = path.join(__dirname, 'app-debug.log');

console.log('Server is running...');

// List of frontend origins that are allowed to access your backend
const allowedOrigins = [
  'http://localhost:3000',              // Your local React/Vue/Svelte dev server
  'http://localhost:3001',              // Your local React/Vue/Svelte dev server
  'http://localhost:8080',              // Your local frontend dev server
  'http://localhost:8181',              // Your local frontend dev server
  'http://localhost:8182',              // Your local frontend dev server
  'https://go01-cod-edge-leader0.go01-dem.ylcu-atmi.cloudera.site' // Your deployed frontend URL
];

const corsOptions = {
  // The origin property checks if the incoming request's origin is in our whitelist.
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, server-to-server, or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  // The credentials property allows cookies and authorization headers to be sent.
  credentials: true,
};

// Use the configured cors middleware
app.use(cors(corsOptions));


//app.use(cors({
//  credentials: true,
//}));

// parse application/json
app.use(bodyParser.json());

function mapToObj(inputMap) {
  let obj = {};

  inputMap.forEach((value, key) => {
    obj[key] = value
  });

  return obj;
}

function edgesToJson(edgeList) {
  return edgeList.map(
    edge => ({
      id: typeof edge.get('id') !== "string" ? JSON.stringify(edge.get('id')) : edge.get('id'),
      from: edge.get('from'),
      to: edge.get('to'),
      label: edge.get('label'),
      properties: mapToObj(edge.get('properties')),
    })
  );
}

function nodesToJson(nodeList) {
  return nodeList.map(
    node => ({
      id: node.get('id'),
      label: node.get('label'),
      properties: mapToObj(node.get('properties')),
      edges: edgesToJson(node.get('edges'))
    })
  );
}

function makeQuery(query, nodeLimit) {
  const nodeLimitQuery = !isNaN(nodeLimit) && Number(nodeLimit) > 0 ? `.limit(${nodeLimit})`: '';
  console.log(`WE AVE  QUERY:  ${query} !`)

  return `${query}${nodeLimitQuery}.dedup().as('node').project('id', 'label', 'properties', 'edges').by(__.id()).by(__.label()).by(__.valueMap().by(__.unfold())).by(__.outE().project('id', 'from', 'to', 'label', 'properties').by(__.id()).by(__.select('node').id()).by(__.inV().id()).by(__.label()).by(__.valueMap().by(__.unfold())).fold())`;
}

app.post('/query', (req, res, next) => {
  const gremlinHost = req.body.host;
  const gremlinPort = req.body.port;
  const nodeLimit = req.body.nodeLimit;
  const query = req.body.query;

  console.log(`SERVER Processing user data: ${query}`);
  const client = new gremlin.driver.Client(`ws://${gremlinHost}:${gremlinPort}/gremlin`, { traversalSource: 'g', mimeType: 'application/json' });

  console.log(`FINISHED Processing user data: ${query}`);
  client.submit(makeQuery(query, nodeLimit), {})
    .then((result) => res.send(nodesToJson(result._items)))
    .catch((err) => next(err));

});

app.listen(port, () => console.log(`Simple gremlin-proxy server listening on port ${port}!`));
