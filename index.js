import express from "express";
import "dotenv/config";
import mysql from "mysql2/promise";
const app = express();

const connection = await mysql.createConnection(
  process.env.MYSQL_CONNECTION_URL
);

app.use(express.json());

try {
  await connection.query(`CREATE TABLE IF NOT EXISTS schools(
    id INT NOT NULL AUTO_INCREMENT,
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

app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  //chack for non-empty data
  if (!name || !address || !latitude || !longitude)
    return res.status(400).json({ message: "Please fill all input fields." });

  //validate provided fields
  if (
    !typeof name === "string" ||
    !typeof address === "string" ||
    parseFloat(latitude) === NaN ||
    parseFloat(longitude) === NaN
  )
    return res.status(400).json({ message: "Please enter valid data." });
  try {
    await connection.query(
      `
        INSERT INTO schools(name, address, latitude, longitude) VALUES(?,?,?,?)
        `,
      [name, address, latitude, longitude]
    );
    return res.status(201).json("School data saved successfully.");
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error in the server" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
