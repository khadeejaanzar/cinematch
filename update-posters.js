
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("./models/Movie");

const imdbIDs = {
  "Good Will Hunting": "tt0119217",
  "The Shawshank Redemption": "tt0111161"
};

async function updatePosters() {
  try {
    if (!process.env.MONGO_URI || !process.env.OMDB_API_KEY) {
      throw new Error("Check MONGO_URI and OMDB_API_KEY in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Find these two movies even if they already have a poster URL.
    const movies = await Movie.find({
      title: {
        $in: Object.keys(imdbIDs)
      }
    });

    console.log(`Target movies found: ${movies.length}`);

    for (const movie of movies) {
      try {
        console.log(`\nChecking: ${movie.title}`);

        const url = new URL("https://www.omdbapi.com/");
        url.searchParams.set("apikey", process.env.OMDB_API_KEY);
        url.searchParams.set("i", imdbIDs[movie.title]);

        const response = await fetch(url);
        const data = await response.json();

        console.log("HTTP status:", response.status);
        console.log("OMDb response:", data);

        if (
          response.ok &&
          data.Response === "True" &&
          data.Poster &&
          data.Poster !== "N/A"
        ) {
          movie.poster = data.Poster;
          await movie.save();

          console.log(`✅ Updated poster: ${movie.title}`);
          console.log("Poster URL:", data.Poster);
        } else {
          console.log(`❌ OMDb did not return a poster for ${movie.title}`);
        }
      } catch (error) {
        console.log(
          `Error updating ${movie.title}: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

updatePosters();
