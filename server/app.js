const express = require("express");
const morgan = require("morgan");
const path = require("path");

const router = require("./api");
const { configuredHelmet, httpsOnly, logErrors, pushStateRouting } = require("./middleware");

const apiRoot = "/api";
const staticDir = path.join(__dirname, "static");

const app = express();

app.use(express.json());
app.use(configuredHelmet());
app.use(logErrors());
app.use(morgan("dev"));

if (app.get("env") === "production") {
	app.enable("trust proxy");
	app.use(httpsOnly());
}

app.use(apiRoot, router);

app.use(express.static(staticDir));
app.use(pushStateRouting(apiRoot, staticDir));

module.exports = app;
