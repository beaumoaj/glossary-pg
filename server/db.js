import { Pool } from "pg";

const dbUrl = process.env.DATABASE_URL; // || "postgres://localhost:5432/cyf";

let config;
if (dbUrl) {
	config = {
		connectionString: dbUrl,
		connectionTimeoutMillis: 5000,
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
const pool = new Pool(config);

export const connectDb = async () => {
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

export const disconnectDb = () => pool.close();

export default { query: pool.query };
