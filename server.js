const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((request, response) => {
  let addr = request.url,
    q = url.parse(addr, true),
    filePath = "";

  if (q.pathname.includes("documentation")) {
    filePath = __dirname + "/documentation.html";
  } else {
    filePath = "index.html";
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(data);
    response.end();

    // Log the request URL and timestamp to log.txt
    let timestamp = new Date().toISOString();
    let logData = `${q.pathname} - ${timestamp}\n`;
    fs.appendFile("log.txt", logData, (err) => {
      if (err) throw err;
    });
  });
});

server.listen(8080, () => {
  console.log("My test server is running on Port 8080.");
});
