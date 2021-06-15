const helmet = require("helmet");
const path = require("path");

exports.configuredHelmet = () => helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			objectSrc: ["'none'"],
			scriptSrc: ["'self'", "unpkg.com", "polyfill.io"],
			styleSrc: ["'self'", "https: 'unsafe-inline'"],
			upgradeInsecureRequests: [],
		},
	},
});

exports.httpsOnly = () => (req, res, next) => {
	if (!req.secure) {
		return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
	}
	next();
};

exports.logErrors = () => (err, _, res, next) => {
	if (res.headersSent) {
		return next(err);
	}
	console.error(err);
	res.sendStatus(500);
};

exports.pushStateRouting = (apiRoot, staticDir) => (req, res, next) => {
	if (req.method === "GET" && !req.url.startsWith(apiRoot)) {
		return res.sendFile(path.join(staticDir, "index.html"));
	}
	next();
};
