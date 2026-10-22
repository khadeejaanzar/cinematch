const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");

const movies = [
  {
    title: "The Godfather",
    genre: "Drama",
    genres: ["Drama", "Crime"],
    year: 1972,
    language: "English",
    duration: 175,
    rating: 9.2,
    description: "The aging patriarch of a powerful crime family transfers control to his reluctant son.",
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino"]
  },
  {
    title: "Pulp Fiction",
    genre: "Thriller",
    genres: ["Crime", "Thriller", "Drama"],
    year: 1994,
    language: "English",
    duration: 154,
    rating: 8.9,
    description: "Interconnected stories of crime and unexpected encounters unfold in Los Angeles.",
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman"]
  },
  {
    title: "Forrest Gump",
    genre: "Drama",
    genres: ["Drama", "Romance"],
    year: 1994,
    language: "English",
    duration: 142,
    rating: 8.8,
    description: "A kind-hearted man witnesses remarkable moments in American history while searching for love.",
    director: "Robert Zemeckis",
    cast: ["Tom Hanks", "Robin Wright"]
  },
  {
    title: "Fight Club",
    genre: "Drama",
    genres: ["Drama", "Thriller"],
    year: 1999,
    language: "English",
    duration: 139,
    rating: 8.8,
    description: "An office worker and a mysterious stranger create an underground fight club.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Edward Norton"]
  },
  {
    title: "The Matrix",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action"],
    year: 1999,
    language: "English",
    duration: 136,
    rating: 8.7,
    description: "A computer hacker discovers that reality is a simulated world controlled by machines.",
    director: "The Wachowskis",
    cast: ["Keanu Reeves", "Carrie-Anne Moss"]
  },
  {
    title: "The Prestige",
    genre: "Thriller",
    genres: ["Thriller", "Drama", "Sci-Fi"],
    year: 2006,
    language: "English",
    duration: 130,
    rating: 8.5,
    description: "Two rival magicians become consumed by a dangerous competition to create the ultimate illusion.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Hugh Jackman"]
  },
  {
    title: "Whiplash",
    genre: "Drama",
    genres: ["Drama", "Music"],
    year: 2014,
    language: "English",
    duration: 106,
    rating: 8.5,
    description: "A young drummer faces an intense instructor at a prestigious music conservatory.",
    director: "Damien Chazelle",
    cast: ["Miles Teller", "J.K. Simmons"]
  },
  {
    title: "Parasite",
    genre: "Thriller",
    genres: ["Thriller", "Drama", "Comedy"],
    year: 2019,
    language: "Korean",
    duration: 132,
    rating: 8.5,
    description: "A struggling family becomes entangled with a wealthy household in an increasingly unsettling story.",
    director: "Bong Joon-ho",
    cast: ["Song Kang-ho", "Choi Woo-shik"]
  },
  {
    title: "Spirited Away",
    genre: "Animation",
    genres: ["Animation", "Adventure", "Fantasy"],
    year: 2001,
    language: "Japanese",
    duration: 125,
    rating: 8.6,
    description: "A young girl enters a mysterious spirit world and must find a way to save her parents.",
    director: "Hayao Miyazaki",
    cast: ["Rumi Hiiragi", "Miyu Irino"]
  },
  {
    title: "Your Name",
    genre: "Romance",
    genres: ["Romance", "Animation", "Fantasy"],
    year: 2016,
    language: "Japanese",
    duration: 106,
    rating: 8.4,
    description: "Two teenagers mysteriously begin switching bodies and search for a connection across time and distance.",
    director: "Makoto Shinkai",
    cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi"]
  },
  {
    title: "The Lion King",
    genre: "Animation",
    genres: ["Animation", "Adventure", "Drama"],
    year: 1994,
    language: "English",
    duration: 88,
    rating: 8.5,
    description: "A young lion must face his past and reclaim his place in the circle of life.",
    director: "Roger Allers and Rob Minkoff",
    cast: ["Matthew Broderick", "James Earl Jones"]
  },
  {
    title: "Coco",
    genre: "Animation",
    genres: ["Animation", "Adventure", "Drama"],
    year: 2017,
    language: "English",
    duration: 105,
    rating: 8.4,
    description: "An aspiring musician enters the Land of the Dead and uncovers his family's history.",
    director: "Lee Unkrich",
    cast: ["Anthony Gonzalez", "Gael García Bernal"]
  },
  {
    title: "Inside Out",
    genre: "Animation",
    genres: ["Animation", "Comedy", "Drama"],
    year: 2015,
    language: "English",
    duration: 95,
    rating: 8.1,
    description: "A young girl's emotions navigate the challenges of growing up after a major move.",
    director: "Pete Docter",
    cast: ["Amy Poehler", "Phyllis Smith"]
  },
  {
    title: "Up",
    genre: "Animation",
    genres: ["Animation", "Adventure", "Comedy"],
    year: 2009,
    language: "English",
    duration: 96,
    rating: 8.3,
    description: "An elderly widower embarks on an extraordinary adventure in a house lifted by balloons.",
    director: "Pete Docter",
    cast: ["Ed Asner", "Jordan Nagai"]
  },
  {
    title: "Dune",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    year: 2021,
    language: "English",
    duration: 155,
    rating: 8.0,
    description: "A gifted young man travels to a dangerous desert planet central to humanity's future.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya"]
  },
  {
    title: "Blade Runner 2049",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Thriller", "Drama"],
    year: 2017,
    language: "English",
    duration: 164,
    rating: 8.0,
    description: "A replicant detective uncovers a secret that could reshape the relationship between humans and replicants.",
    director: "Denis Villeneuve",
    cast: ["Ryan Gosling", "Harrison Ford"]
  },
  {
    title: "Gravity",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Thriller"],
    year: 2013,
    language: "English",
    duration: 91,
    rating: 7.7,
    description: "Two astronauts fight to survive after debris destroys their spacecraft.",
    director: "Alfonso Cuarón",
    cast: ["Sandra Bullock", "George Clooney"]
  },
  {
    title: "Edge of Tomorrow",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Action"],
    year: 2014,
    language: "English",
    duration: 113,
    rating: 7.9,
    description: "A soldier caught in a time loop repeatedly fights an alien invasion.",
    director: "Doug Liman",
    cast: ["Tom Cruise", "Emily Blunt"]
  },
  {
    title: "The Truman Show",
    genre: "Drama",
    genres: ["Drama", "Comedy", "Sci-Fi"],
    year: 1998,
    language: "English",
    duration: 103,
    rating: 8.2,
    description: "A man begins to suspect that his seemingly ordinary life is an elaborate television production.",
    director: "Peter Weir",
    cast: ["Jim Carrey", "Laura Linney"]
  },
  {
    title: "Dead Poets Society",
    genre: "Drama",
    genres: ["Drama"],
    year: 1989,
    language: "English",
    duration: 128,
    rating: 8.1,
    description: "An unconventional teacher inspires students at a strict boarding school to think independently.",
    director: "Peter Weir",
    cast: ["Robin Williams", "Ethan Hawke"]
  },
  {
    title: "Good Will Hunting",
    genre: "Drama",
    genres: ["Drama", "Romance"],
    year: 1997,
    language: "English",
    duration: 126,
    rating: 8.3,
    description: "A gifted young janitor receives guidance as he confronts his past and extraordinary potential.",
    director: "Gus Van Sant",
    cast: ["Matt Damon", "Robin Williams"]
  },
  {
    title: "The Green Mile",
    genre: "Drama",
    genres: ["Drama", "Fantasy", "Crime"],
    year: 1999,
    language: "English",
    duration: 189,
    rating: 8.6,
    description: "A prison guard encounters a death-row inmate with a mysterious and extraordinary gift.",
    director: "Frank Darabont",
    cast: ["Tom Hanks", "Michael Clarke Duncan"]
  },
  {
    title: "Gladiator",
    genre: "Action",
    genres: ["Action", "Drama", "Adventure"],
    year: 2000,
    language: "English",
    duration: 155,
    rating: 8.5,
    description: "A betrayed Roman general fights his way through the arena seeking justice.",
    director: "Ridley Scott",
    cast: ["Russell Crowe", "Joaquin Phoenix"]
  },
  {
    title: "John Wick",
    genre: "Action",
    genres: ["Action", "Thriller"],
    year: 2014,
    language: "English",
    duration: 101,
    rating: 7.4,
    description: "A retired assassin returns to the criminal underworld after a devastating personal loss.",
    director: "Chad Stahelski",
    cast: ["Keanu Reeves", "Michael Nyqvist"]
  },
  {
    title: "Top Gun: Maverick",
    genre: "Action",
    genres: ["Action", "Drama"],
    year: 2022,
    language: "English",
    duration: 130,
    rating: 8.2,
    description: "A veteran pilot trains a new generation for an exceptionally dangerous mission.",
    director: "Joseph Kosinski",
    cast: ["Tom Cruise", "Miles Teller"]
  },
  {
    title: "The Avengers",
    genre: "Action",
    genres: ["Action", "Adventure", "Sci-Fi"],
    year: 2012,
    language: "English",
    duration: 143,
    rating: 8.0,
    description: "Earth's mightiest heroes unite to stop a threat to humanity.",
    director: "Joss Whedon",
    cast: ["Robert Downey Jr.", "Chris Evans"]
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    genre: "Animation",
    genres: ["Animation", "Action", "Adventure"],
    year: 2018,
    language: "English",
    duration: 117,
    rating: 8.4,
    description: "Miles Morales discovers his powers and meets Spider-People from different dimensions.",
    director: "Bob Persichetti, Peter Ramsey and Rodney Rothman",
    cast: ["Shameik Moore", "Jake Johnson"]
  },
  {
    title: "The Grand Budapest Hotel",
    genre: "Comedy",
    genres: ["Comedy", "Adventure", "Drama"],
    year: 2014,
    language: "English",
    duration: 99,
    rating: 8.1,
    description: "A hotel concierge and his protégé become caught in a mystery involving a valuable painting.",
    director: "Wes Anderson",
    cast: ["Ralph Fiennes", "Tony Revolori"]
  },
  {
    title: "Knives Out",
    genre: "Thriller",
    genres: ["Thriller", "Comedy", "Crime"],
    year: 2019,
    language: "English",
    duration: 130,
    rating: 7.9,
    description: "A detective investigates a novelist's death amid a family full of suspects.",
    director: "Rian Johnson",
    cast: ["Daniel Craig", "Ana de Armas"]
  },
  {
    title: "La La Land",
    genre: "Romance",
    genres: ["Romance", "Drama", "Music"],
    year: 2016,
    language: "English",
    duration: 128,
    rating: 8.0,
    description: "An aspiring actress and a jazz musician fall in love while pursuing their dreams in Los Angeles.",
    director: "Damien Chazelle",
    cast: ["Ryan Gosling", "Emma Stone"]
  },
  {
    title: "Pride and Prejudice",
    genre: "Romance",
    genres: ["Romance", "Drama"],
    year: 2005,
    language: "English",
    duration: 129,
    rating: 7.8,
    description: "Elizabeth Bennet and Mr Darcy navigate first impressions, family expectations and affection.",
    director: "Joe Wright",
    cast: ["Keira Knightley", "Matthew Macfadyen"]
  },
  {
    title: "Before Sunrise",
    genre: "Romance",
    genres: ["Romance", "Drama"],
    year: 1995,
    language: "English",
    duration: 101,
    rating: 8.1,
    description: "Two young strangers spend a night walking and talking through Vienna.",
    director: "Richard Linklater",
    cast: ["Ethan Hawke", "Julie Delpy"]
  },
  {
    title: "Little Women",
    genre: "Drama",
    genres: ["Drama", "Romance"],
    year: 2019,
    language: "English",
    duration: 135,
    rating: 7.8,
    description: "Four sisters navigate ambition, family and adulthood during the nineteenth century.",
    director: "Greta Gerwig",
    cast: ["Saoirse Ronan", "Florence Pugh"]
  },
  {
    title: "The Devil Wears Prada",
    genre: "Comedy",
    genres: ["Comedy", "Drama"],
    year: 2006,
    language: "English",
    duration: 109,
    rating: 6.9,
    description: "A young journalist enters the demanding world of high fashion under a formidable editor.",
    director: "David Frankel",
    cast: ["Meryl Streep", "Anne Hathaway"]
  },
  {
    title: "Zindagi Na Milegi Dobara",
    genre: "Drama",
    genres: ["Drama", "Adventure", "Comedy"],
    year: 2011,
    language: "Hindi",
    duration: 155,
    rating: 8.2,
    description: "Three friends take a road trip through Spain that challenges their fears and friendships.",
    director: "Zoya Akhtar",
    cast: ["Hrithik Roshan", "Farhan Akhtar"]
  },
  {
    title: "3 Idiots",
    genre: "Comedy",
    genres: ["Comedy", "Drama"],
    year: 2009,
    language: "Hindi",
    duration: 170,
    rating: 8.4,
    description: "Three engineering students question the pressure and expectations of the education system.",
    director: "Rajkumar Hirani",
    cast: ["Aamir Khan", "R. Madhavan"]
  },
  {
    title: "Dangal",
    genre: "Drama",
    genres: ["Drama", "Sport"],
    year: 2016,
    language: "Hindi",
    duration: 161,
    rating: 8.3,
    description: "A former wrestler trains his daughters to compete in wrestling despite social expectations.",
    director: "Nitesh Tiwari",
    cast: ["Aamir Khan", "Fatima Sana Shaikh"]
  },
  {
    title: "Andhadhun",
    genre: "Thriller",
    genres: ["Thriller", "Crime", "Comedy"],
    year: 2018,
    language: "Hindi",
    duration: 139,
    rating: 8.2,
    description: "A pianist becomes entangled in a murder mystery where appearances are deceiving.",
    director: "Sriram Raghavan",
    cast: ["Ayushmann Khurrana", "Tabu"]
  },
  {
    title: "Queen",
    genre: "Comedy",
    genres: ["Comedy", "Drama"],
    year: 2013,
    language: "Hindi",
    duration: 146,
    rating: 8.1,
    description: "A young woman travels alone on her planned honeymoon after her wedding is called off.",
    director: "Vikas Bahl",
    cast: ["Kangana Ranaut", "Rajkummar Rao"]
  },
  {
    title: "Kumbalangi Nights",
    genre: "Drama",
    genres: ["Drama", "Romance"],
    year: 2019,
    language: "Malayalam",
    duration: 135,
    rating: 8.5,
    description: "Four brothers in a coastal Kerala village confront their differences and learn to become a family.",
    director: "Madhu C. Narayanan",
    cast: ["Shane Nigam", "Soubin Shahir"]
  },
  {
    title: "Bangalore Days",
    genre: "Romance",
    genres: ["Romance", "Comedy", "Drama"],
    year: 2014,
    language: "Malayalam",
    duration: 171,
    rating: 8.3,
    description: "Three cousins move to Bangalore and discover love, independence and unexpected challenges.",
    director: "Anjali Menon",
    cast: ["Dulquer Salmaan", "Nivin Pauly"]
  },
  {
    title: "Premam",
    genre: "Romance",
    genres: ["Romance", "Comedy", "Drama"],
    year: 2015,
    language: "Malayalam",
    duration: 156,
    rating: 8.3,
    description: "A young man's experiences with love change as he moves through different stages of life.",
    director: "Alphonse Puthren",
    cast: ["Nivin Pauly", "Sai Pallavi"]
  },
  {
    title: "Drishyam",
    genre: "Thriller",
    genres: ["Thriller", "Crime", "Drama"],
    year: 2013,
    language: "Malayalam",
    duration: 164,
    rating: 8.3,
    description: "A resourceful father goes to extraordinary lengths to protect his family after a crime.",
    director: "Jeethu Joseph",
    cast: ["Mohanlal", "Meena"]
  },
  {
    title: "Manichitrathazhu",
    genre: "Horror",
    genres: ["Horror", "Thriller", "Drama"],
    year: 1993,
    language: "Malayalam",
    duration: 169,
    rating: 8.7,
    description: "A family in an old mansion encounters unsettling events connected to a mysterious room.",
    director: "Fazil",
    cast: ["Mohanlal", "Shobana"]
  },
  {
    title: "Charlie",
    genre: "Adventure",
    genres: ["Adventure", "Romance", "Drama"],
    year: 2015,
    language: "Malayalam",
    duration: 130,
    rating: 8.0,
    description: "A free-spirited woman follows the trail of an enigmatic artist through Kerala.",
    director: "Martin Prakkat",
    cast: ["Dulquer Salmaan", "Parvathy Thiruvothu"]
  },
  {
    title: "Super Deluxe",
    genre: "Thriller",
    genres: ["Thriller", "Drama", "Comedy"],
    year: 2019,
    language: "Tamil",
    duration: 176,
    rating: 8.2,
    description: "Several unusual lives intersect in a series of stories about chance, identity and human choices.",
    director: "Thiagarajan Kumararaja",
    cast: ["Vijay Sethupathi", "Fahadh Faasil"]
  },
  {
    title: "96",
    genre: "Romance",
    genres: ["Romance", "Drama"],
    year: 2018,
    language: "Tamil",
    duration: 158,
    rating: 8.5,
    description: "Two former classmates reunite years later and revisit the feelings and memories of their youth.",
    director: "C. Prem Kumar",
    cast: ["Vijay Sethupathi", "Trisha"]
  },
  {
    title: "Vikram",
    genre: "Action",
    genres: ["Action", "Thriller", "Crime"],
    year: 2022,
    language: "Tamil",
    duration: 174,
    rating: 8.3,
    description: "A covert investigation leads to a dangerous criminal network and a secretive operative.",
    director: "Lokesh Kanagaraj",
    cast: ["Kamal Haasan", "Vijay Sethupathi"]
  },
  {
    title: "Soorarai Pottru",
    genre: "Drama",
    genres: ["Drama"],
    year: 2020,
    language: "Tamil",
    duration: 153,
    rating: 8.7,
    description: "An ambitious man fights overwhelming obstacles to make air travel affordable to ordinary people.",
    director: "Sudha Kongara",
    cast: ["Suriya", "Aparna Balamurali"]
  },
  {
    title: "Jai Bhim",
    genre: "Drama",
    genres: ["Drama", "Crime"],
    year: 2021,
    language: "Tamil",
    duration: 164,
    rating: 8.7,
    description: "A lawyer fights for justice for a tribal woman whose husband has disappeared in police custody.",
    director: "T. J. Gnanavel",
    cast: ["Suriya", "Lijomol Jose"]
  },
  {
    title: "RRR",
    genre: "Action",
    genres: ["Action", "Drama", "Adventure"],
    year: 2022,
    language: "Telugu",
    duration: 187,
    rating: 7.8,
    description: "Two revolutionaries form a powerful friendship in a fictionalized story set during British rule in India.",
    director: "S. S. Rajamouli",
    cast: ["N. T. Rama Rao Jr.", "Ram Charan"]
  },
  {
    title: "Baahubali: The Beginning",
    genre: "Action",
    genres: ["Action", "Adventure", "Drama"],
    year: 2015,
    language: "Telugu",
    duration: 159,
    rating: 8.0,
    description: "A young man discovers his connection to an ancient kingdom and its struggle for power.",
    director: "S. S. Rajamouli",
    cast: ["Prabhas", "Rana Daggubati"]
  },
  {
    title: "Train to Busan",
    genre: "Horror",
    genres: ["Horror", "Action", "Thriller"],
    year: 2016,
    language: "Korean",
    duration: 118,
    rating: 7.6,
    description: "Passengers fight to survive a zombie outbreak aboard a train travelling across South Korea.",
    director: "Yeon Sang-ho",
    cast: ["Gong Yoo", "Ma Dong-seok"]
  }
];

async function seedMovies() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    let added = 0;
    let skipped = 0;

    for (const movie of movies) {
      const existingMovie = await Movie.findOne({
        title: {
          $regex: `^${movie.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        }
      });

      if (existingMovie) {
        skipped++;
        continue;
      }

      await Movie.create(movie);
      added++;
      console.log(`Added: ${movie.title}`);
    }

    console.log("\nMovie seeding completed!");
    console.log(`New movies added: ${added}`);
    console.log(`Existing movies skipped: ${skipped}`);
    console.log(`Total movies in database: ${await Movie.countDocuments()}`);
  } catch (error) {
    console.error("Error adding movies:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedMovies();
