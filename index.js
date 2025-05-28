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

// function to get distance through Haversine formula
const getDistance = (latitude1, longitude1, latitude2, longitude2) => {
  const earthRadius = 6371;
  const dLatitude = ((latitude2 - latitude1) * Math.PI) / 180;
  const dLongitude = ((longitude2 - longitude1) * Math.PI) / 180;
  const a =
    Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(dLongitude / 2) *
      Math.sin(dLongitude / 2);
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * centralAngle;
};

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
    return res.status(201).json({ message: "School data saved successfully." });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error in the server" });
  }
});

app.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;
  //check if non-empty data
  if (!latitude || !longitude)
    return res.status(400).json({ message: "Necessary field missing." });

  //validate data
  if (parseFloat(latitude) === NaN || parseFloat(longitude) === NaN)
    return res.status(400).json({ message: "Please enter valid data." });

  const floorLatitude = Math.floor(parseFloat(latitude));
  const floorLongitude = Math.floor(parseFloat(longitude));

  try {
    const [schools] = await connection.query("SELECT * FROM schools");
    // sort all schools based on geographical distance
    const newSortedSchools = schools
      .map((school) => ({
        ...school,
        distance: getDistance(
          floorLatitude,
          floorLongitude,
          school.latitude,
          school.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
    return res.status(200).json({ schools: newSortedSchools });
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
