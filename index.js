import express from "express";
import "dotenv/config";
import mysql from "mysql2/promise";
const app = express();

const connection = await mysql.createConnection(
  process.env.MYSQL_CONNECTION_URL
);

app.use(express.json());

try {
  await connection.query(`CREATE TABLE IF NOT EXISTS school(
    id INT,
    name VARCHAR(100),
    address VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    PRIMARY KEY(id)
    );`);
  console.log("table creation success");
} catch (error) {
  console.log(error);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
