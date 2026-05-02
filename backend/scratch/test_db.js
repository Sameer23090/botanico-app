const mongoose = require('mongoose');
const uri = "mongodb+srv://root:Botanico2024@botanico.z4cs4aw.mongodb.net/?appName=botanico";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
