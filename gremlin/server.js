const express = require('express');
const bodyParser = require('body-parser');
const gremlin = require('gremlin');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// 1. Import EventEmitter instead of EventTarget
const EventEmitter = require('events');

const app = express();
const port = 3001;
const logFilePath = path.join(__dirname, 'app-debug.log');

// 2. Create a new EventEmitter instance
const appEvents = new EventEmitter();

console.log('Server is running...');

// --- Your CORS and helper functions remain the same ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://localhost:8181',
  'http://localhost:8182',
  'https://go01-cod-edge-leader0.go01-dem.ylcu-atmi.cloudera.site'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

function mapToObj(inputMap) {
  let obj = {};
  inputMap.forEach((value, key) => { obj[key] = value });
  return obj;
}
function edgesToJson(edgeList) {
  return edgeList.map(edge => ({
    id: typeof edge.get('id') !== "string" ? JSON.stringify(edge.get('id')) : edge.get('id'),
    from: edge.get('from'),
    to: edge.get('to'),
    label: edge.get('label'),
    properties: mapToObj(edge.get('properties')),
  }));
}
function nodesToJson(nodeList) {
  return nodeList.map(node => ({
    id: node.get('id'),
    label: node.get('label'),
    properties: mapToObj(node.get('properties')),
    edges: edgesToJson(node.get('edges'))
  }));
}
function makeQuery(query, nodeLimit) {
  const nodeLimitQuery = !isNaN(nodeLimit) && Number(nodeLimit) > 0 ? `.limit(${nodeLimit})`: '';
  return `${query}${nodeLimitQuery}.dedup().as('node').project('id', 'label', 'properties', 'edges').by(__.id()).by(__.label()).by(__.valueMap().by(__.unfold())).by(__.outE().project('id', 'from', 'to', 'label', 'properties').by(__.id()).by(__.select('node').id()).by(__.inV().id()).by(__.label()).by(__.valueMap().by(__.unfold())).fold())`;
}
// --- End of unchanged code ---


// 3. Set up event listeners using the `.on()` method
// This listener handles successful queries
appEvents.on('query:success', (payload) => {
  const { query, nodeLimit } = payload;
  const logMessage = `[${new Date().toISOString()}] SUCCESS: Query='${query}', Limit=${nodeLimit}\n`;
  console.log(`EVENT [query:success]: Firing log write.`);
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
});

// This listener handles failed queries
appEvents.on('query:error', (payload) => {
  const { query, error } = payload;
  const logMessage = `[${new Date().toISOString()}] ERROR: Query='${query}', Error='${error.message}'\n`;
  console.error(`EVENT [query:error]: Firing log write for error: ${error.message}`);
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
});


app.post('/query', (req, res, next) => {
  const { host, port: gremlinPort, nodeLimit, query } = req.body;

  console.log(`SERVER Processing user data: ${query}`);
// set agent:false to prevent the use of the  global websocket , which doesn't not have an on() method. The Gremlin JS lib has a bug.
  const client = new gremlin.driver.Client(`ws://${host}:${gremlinPort}/gremlin`, { traversalSource: 'g', mimeType: 'application/vnd.gremlin-v3.0+json', agent: false });
  
  client.submit(makeQuery(query, nodeLimit), {})
    .then((result) => {
      // 4. Dispatch events using `.emit()`, passing the payload directly
      appEvents.emit('query:success', { query, nodeLimit });
      res.send(nodesToJson(result._items));
    })
    .catch((err) => {
      // Dispatch an error event
      appEvents.emit('query:error', { query, error: err });
      next(err); // Pass the error to Express's error handler
    });
});

app.listen(port, () => console.log(`Simple gremlin-proxy server listening on port ${port}!`));
