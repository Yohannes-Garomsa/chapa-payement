const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

function serveCheckout(response) {
  const checkout = fs.readFileSync(path.join(__dirname, "checkout.html"));
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(checkout);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    request.on("end", () => resolve(JSON.parse(body)));
    request.on("error", reject);
  });
}

async function createCheckout(request, response) {
  if (!chapaSecretKey) {
    return sendJson(response, 500, {
      error: "Set CHAPA_SECRET_KEY to your Chapa test secret key first.",
    });
  }

  try {
    const input = await readBody(request);
    const chapaResponse = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(input.amount),
          currency: input.currency,
          email: input.email,
          first_name: input.first_name,
          last_name: input.last_name,
          phone_number: input.phone_number,
          tx_ref: input.tx_ref,
          callback_url: process.env.CHAPA_CALLBACK_URL || "https://example.com/callback",
          return_url: process.env.CHAPA_RETURN_URL || "http://localhost:3000/checkout.html",
          customization: {
            title: "Test payment",
            description: "Chapa test-mode payment",
          },
        }),
      },
    );

    const result = await chapaResponse.json();
    sendJson(response, chapaResponse.status, result);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/") {
    return serveCheckout(response);
  }

  if (request.method === "GET" && request.url === "/checkout.html") {
    return serveCheckout(response);
  }

  if (request.method === "POST" && request.url === "/create-checkout") {
    return createCheckout(request, response);
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`Checkout is running at http://localhost:${port}`);
});
var request = require('request');
  var options = {
    'method': 'POST',
    'url': 'https://api.chapa.co/v1/transaction/initialize',
    'headers': {
  'Authorization': 'Bearer CHASECK-xxxxxxxxxxxxxxxx',
  'Content-Type': 'application/json'
    },
    body: JSON.stringify({
  "amount": "10",
  "currency": "ETB",
  "email": "abebech_bekele@gmail.com",
  "first_name": "Bilen",
  "last_name": "Gizachew",
  "phone_number": "0912345678",
  "tx_ref": "chewatatest-6669",
  "callback_url": "https://webhook.site/077164d6-29cb-40df-ba29-8a00e59a7e60",
  "return_url": "https://www.google.com/",
  "customization[title]": "Payment for my favourite merchant",
  "customization[description]": "I love online payments",
  "meta[hide_receipt]": "true",
  "meta[invoices]": "[{"key": "Paracetamol", "value": "2pcs"}, {"key": "Ibuprofen", "value": "1pcs"}]"
    })

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
  