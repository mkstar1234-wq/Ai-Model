const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Got response length:', data.length);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
