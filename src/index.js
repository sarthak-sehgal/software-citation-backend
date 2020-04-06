const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ZENODO_URL = "https://zenodo.org/api/deposit/depositions";
const GITHUB_URL = "https://api.github.com";
const uuid = require("uuid").v4;

// initialise express
const app = express();
app.use(bodyParser.json());

/** ONLY FOR DEVELOPMENT */
app.use(function (req, res, next) {
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
        message: "Invalid Zenodo access token.",
      })
    );
  }
  if (response.headersSent) return;

  fetch(ZENODO_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${data.token}`,
    },
    body: JSON.stringify({}),
  })
    .then((res) => res.json())
    .then((res) => {
      if (
        res &&
        res.metadata &&
        res.metadata.prereserve_doi &&
        res.metadata.prereserve_doi.doi
      ) {
        response.send(
          JSON.stringify({
            status: 1,
            message: res.metadata.prereserve_doi.doi,
          })
        );
        return;
      }
      if (response.headersSent) return;
      response.send(
        JSON.stringify({
          status: 0,
          message:
            "Please make sure that you have given write permission to Zenodo access token.",
        })
      );
    })
    .catch((err) => {
      console.log("Error occurred!", err);
      response.send(
        JSON.stringify({
          status: 0,
          message:
            "Please make sure that you have given write permission to Zenodo access token.",
        })
      );
    })
    .catch((err) => {
      console.log("Error occurred!", err);
      response.send(
        JSON.stringify({
          status: 0,
          message:
            "Please make sure that you have given write permission to Zenodo access token.",
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
      repo: url[2],
    };
  }

  if (!data.githubUrl || !data.githubUrl.trim()) {
    response.send(
      JSON.stringify({
        status: 0,
        message: "Invalid GitHub URL.",
      })
    );
    return;
  }

  githubUrl = parseGithubUrl(data.githubUrl);

  fetch(GITHUB_URL + `/repos/${githubUrl.owner}/${githubUrl.repo}`, {
    method: "GET",
  })
    .then((res) => {
      if (res.status == 200) {
        return res.json();
      } else {
        response.send(
          JSON.stringify({
            status: 2,
            message:
              "Error getting details from GitHub. Please make sure that the URL is correct.",
            // ** TO BE FILLED **
            data: {},
          })
        );
      }
    })
    .then((res) => {
      response.send(
        JSON.stringify({
          status: 1,
          message: "Successfully got data from GitHub.",
          data: {
            title: res.name,
            description: res.description,
          },
        })
      );
    })
    .catch((err) => {
      //   console.log(err);
      response.send(
        JSON.stringify({
          status: 2,
          message:
            "Error getting details from GitHub. Please make sure that the URL is correct.",
          // ** TO BE FILLED **
          data: {},
        })
      );
    })
    .catch((err) => {
      //   console.log(err);
      response.send(
        JSON.stringify({
          status: 2,
          message:
            "Error getting details from GitHub. Please make sure that the URL is correct.",
          // ** TO BE FILLED **
          data: {},
        })
      );
    });
});

// sample CFF object
const SAMPLE_CFF_OBJ = {
  ["cff-version"]: "1.1.0",
  message: "Please cite the following works when using this software.",
  abstract: "",
  authors: [
    {
      ["given-names"]: "",
      ["family-names"]: "",
      orcid: "",
      email: "",
      website: "",
    },
  ],
  ["date-released"]: "",
  doi: "",
  keywords: [],
  license: "",
  repository: "",
  title: "",
  url: "",
  version: "",
};
const REQUIRED_FIELDS = [
  "message",
  // "authors",
  "date-released",
  "title",
  "version",
];

app.post("/generate-cff", (req, response) => {
  console.log("Request /generate-cff received");
  response.setHeader("Content-Type", "application/json");
  const data = req.body;

  if (!validateData(data)) {
    response.send(
      JSON.stringify({
        status: 0,
        message: "One or many required fields are missing or invalid.",
      })
    );
  }
  if (response.headersSent) return;

  const fileName = uuid(),
    dirPath = path.resolve(__dirname, "../", "data"),
    filePath = path.resolve(dirPath, fileName + ".cff");

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  fs.writeFileSync(filePath, generateCff(data), { encoding: "utf8" });

  if (fs.existsSync(filePath)) {
    response.send(
      JSON.stringify({
        status: 1,
        message: fileName,
      })
    );
  }

  if (response.headersSent) return;

  response.send(
    JSON.stringify({
      status: 0,
      message: "Some error occurred. Please try again.",
    })
  );
});

const validateData = (data) => {
  if (!data) return false;

  REQUIRED_FIELDS.map((field) => {
    // if (!data["authors"] || data["authors"] == {})
    // 	return false;
    if (isEmptyString(data[field])) return false;
  });

  // validate date
  if (!isValidDate(data["date-released"])) return false;
  // validate authors
  // data.authors.map(author => {
  // 	if (isEmptyString(author["family-names"]) || isEmptyString(authors["given-names"]))
  // 		return false;
  // })

  return true;
};

const isEmptyString = (string) => {
  return !string || string.trim() == "";
};

const isValidDate = (dateString) => {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
};

const generateCff = (data) => {
  let res = "";
  res += `cff-version: ${SAMPLE_CFF_OBJ["cff-version"]}
message: ${data.message}
title: ${data.title}
version: ${data.version}
date-released: ${data["date-released"]}\n`;
  if (!isEmptyString(data.abstract)) res += `abstract: ${data.abstract}\n`;
  return res;
};

app.get("/download", (req, response) => {
  console.log("Request /download received");
  const fileName = req.query.name,
    filePath = path.resolve(__dirname, "../", "data", fileName + ".cff");

  response.setHeader("Content-Type", "application/octet-stream");
  response.setHeader("Content-Disposition", `attachment; filename=${fileName}.cff`);

  if (!fs.existsSync(filePath)) {
		console.log("File does not exist!");
  }

  response.download(filePath, "CITATION.cff", (err) => {
    if (err) {
      console.log(err);
    }
  });
});

app.listen(process.env.port || 8000);
console.log("App hosted on localhost:8000");