const app = require('./server');
let config = require('./config');

const port = process.env.PORT || config.port;
// Server
app.listen(port, () => {
   console.log(`Listening on: http://localhost:${port}`);
});