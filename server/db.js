const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const dbUrl = process.env.DATABASE_URL; // || "postgres://localhost:5432/cyf";

let config;
if (dbUrl) {
	config = {
		connectionString: dbUrl,
		connectionTimeoutMillis: 5000,
		ssl: {
			rejectUnauthorized: false
		}
	};
} else {
	config = {
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT
	};
}
console.log(process.cwd());
console.log(config);
const pool = new Pool(config);

exports.connectDb = async () => {
	let client;
	try {
		client = await pool.connect();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	console.log("Postgres connected to", client.database);
	client.release();
};

exports.disconnectDb = () => pool.end();

exports.database = pool;
