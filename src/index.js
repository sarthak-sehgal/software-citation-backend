const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ZENODO_URL = "https://zenodo.org/api/deposit/depositions";
const GITHUB_URL = "https://api.github.com";

// initialise express
const app = express();
app.use(bodyParser.json());

/** ONLY FOR DEVELOPMENT */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
/** END DEVELOPMENT CODE */

app.post("/get-doi", (req, response) => {
  console.log("Request /getDoi received");
  response.setHeader("Content-Type", "application/json");
  const data = req.body;
  if (!data.token || !data.token.trim()) {
    response.send(
      JSON.stringify({
        status: 0,
        message: "Invalid Zenodo access token."
      })
    );
    return;
  }
  fetch(ZENODO_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${data.token}`
    },
    body: JSON.stringify({})
  })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      response.send(
        JSON.stringify({
          status: 1,
          message: res.metadata.prereserve_doi.doi
        })
      );
    })
    .catch(err => {
      console.log("Error occurred!", err);
      response.send(
        JSON.stringify({
          status: 0,
          message:
            "Please make sure that you have given write permission to Zenodo access token."
        })
      );
    })
    .catch(err => {
      console.log("Error occurred!", err);
      response.send(
        JSON.stringify({
          status: 0,
          message:
            "Please make sure that you have given write permission to Zenodo access token."
        })
      );
    });
});

app.post("/get-gh-data", (req, response) => {
  console.log("Request /get-gh-data received");
  response.setHeader("Content-Type", "application/json");
  const data = req.body;

  function parseGithubUrl(url) {
    url = url.toLowerCase();
    url = url.slice(url.indexOf("github"));
    if (url[url.length - 1] == "/") url = url.slice(0, -1);
    url = url.split("/");
    return {
      owner: url[1],
      repo: url[2]
    };
  }

  if (!data.githubUrl || !data.githubUrl.trim()) {
    response.send(
      JSON.stringify({
        status: 0,
        message: "Invalid GitHub URL."
      })
    );
    return;
  }

  githubUrl = parseGithubUrl(data.githubUrl);

  fetch(GITHUB_URL + `/repos/${githubUrl.owner}/${githubUrl.repo}`, {
    method: "GET"
  })
    .then(res => {
      if (res.status == 200) {
        return res.json();
      } else {
        response.send(
          JSON.stringify({
            status: 2,
            message:
              "Error getting details from GitHub. Please make sure that the URL is correct.",
            // ** TO BE FILLED **
            data: {}
          })
        );
      }
    })
    .then(res => {
      response.send(
        JSON.stringify({
          status: 1,
          message: "Successfully got data from GitHub.",
          data: {
            title: res.name,
            description: res.description
          }
        })
      );
    })
    .catch(err => {
      //   console.log(err);
      response.send(
        JSON.stringify({
          status: 2,
          message:
            "Error getting details from GitHub. Please make sure that the URL is correct.",
          // ** TO BE FILLED **
          data: {}
        })
      );
    })
    .catch(err => {
      //   console.log(err);
      response.send(
        JSON.stringify({
          status: 2,
          message:
            "Error getting details from GitHub. Please make sure that the URL is correct.",
          // ** TO BE FILLED **
          data: {}
        })
      );
    });
});

app.listen(process.env.port || 8000);
console.log("App hosted on localhost:8000");
