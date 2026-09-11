const mongoose = require('mongoose');
const Movie = require('./models/Movie');
require('dotenv').config({ path: __dirname + '/.env' });

const seedData = [
  {
    id: 1,
    title: "Kalki 2898 AD",
    genre: "Sci-Fi / Action (Tollywood)",
    rating: "8.5/10",
    price: "₹350",
    posterUrl: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS7GJtGGybUwdZIW9QlQoq_HAvlqiSx73qWFjXr74FjrFMtmveR",
    certification: "UA",
    trailerUrl: "https://www.youtube.com/embed/kQ1E5cEnbY4",
    type: "movie",
    trending: true,
    vibe: "Vibrant",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 2,
    title: "Param Sundari",
    genre: "Comedy / Romantic (Bollywood)",
    rating: "9.5/10",
    price: "₹300",
    posterUrl: "https://stat5.bollywoodhungama.in/wp-content/uploads/2024/12/Param-Sundari-4-306x393.jpg",
    certification: "U",
    trailerUrl: "https://www.youtube.com/embed/ZzE8NnQn18U",
    type: "movie",
    trending: true,
    vibe: "Chill",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 3,
    title: "Saiyaara",
    genre: "Emotional /Romantic  (Bollywood)",
    rating: "9.0/10",
    price: "₹400",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Saiyaara_film_poster.jpg/250px-Saiyaara_film_poster.jpg",
    certification: "U",
    trailerUrl: "https://www.youtube.com/embed/hJqEY1p68s0",
    type: "movie",
    trending: false,
    vibe: "Nostalgic",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 4,
    title: "Animal",
    genre: "Action / Crime (Bollywood)",
    rating: "7.8/10",
    price: "₹350",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Animal_%282023_film%29_poster.jpg/250px-Animal_%282023_film%29_poster.jpg",
    certification: "A",
    trailerUrl: "https://www.youtube.com/embed/8FkLRm2bNIs",
    type: "movie",
    trending: true,
    vibe: "Intense",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 5,
    title: "Pushpa 2: The Rule",
    genre: "Action / Drama (Tollywood)",
    rating: "8.9/10",
    price: "₹350",
    posterUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqu3c5RDXSXuWmhfsjt4qL6Qyy2c2UGhqS_g&s",
    certification: "UA",
    trailerUrl: "https://www.youtube.com/embed/1kUK0O-zB2A",
    type: "movie",
    trending: true,
    vibe: "Intense",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 6,
    title: "Pathaan",
    genre: "Action / Spy (Bollywood)",
    rating: "7.5/10",
    price: "₹300",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/c/c3/Pathaan_film_poster.jpg",
    certification: "UA",
    trailerUrl: "https://www.youtube.com/embed/vqu4z34wENw",
    type: "movie",
    trending: false,
    vibe: "Vibrant",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 7,
    title: "Dune: Part Two",
    genre: "Sci-Fi / Action (Hollywood)",
    rating: "8.8/10",
    price: "₹450",
    posterUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq8P5uwVwfPAX9FnmiLtcFECf8l28lS9FN-g&s",
    certification: "UA",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    type: "movie",
    trending: true,
    vibe: "Vibrant",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 8,
    title: "Oppenheimer",
    genre: "Biography (Hollywood)",
    rating: "8.4/10",
    price: "₹400",
    posterUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Oppenheimer_%28film%29.jpg/250px-Oppenheimer_%28film%29.jpg",
    certification: "A",
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    type: "movie",
    trending: false,
    vibe: "Nostalgic",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 9,
    title: "Breaking Bad",
    genre: "Crime / Thriller",
    rating: "9.5/10",
    price: "₹150",
    posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1500&auto=format&fit=crop",
    certification: "A",
    trailerUrl: "https://www.youtube.com/embed/HhesaQXLuRY",
    type: "tv-show",
    trending: true,
    vibe: "Intense",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 10,
    title: "Stranger Things",
    genre: "Sci-Fi / Horror",
    rating: "8.7/10",
    price: "₹200",
    posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1500&auto=format&fit=crop",
    certification: "UA",
    trailerUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
    type: "tv-show",
    trending: true,
    vibe: "Nostalgic",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 11,
    title: "Panchayat",
    genre: "Comedy / Drama",
    rating: "8.9/10",
    price: "₹100",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1500&auto=format&fit=crop",
    certification: "U",
    trailerUrl: "https://www.youtube.com/embed/mojZJ7OeD_g",
    type: "tv-show",
    trending: false,
    vibe: "Chill",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 12,
    title: "The Boys",
    genre: "Action / Dark Comedy",
    rating: "8.7/10",
    price: "₹250",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1500&auto=format&fit=crop",
    certification: "A",
    trailerUrl: "https://www.youtube.com/embed/M1bhOaLV4FU",
    type: "tv-show",
    trending: true,
    vibe: "Intense",
    showTime: ["10:30 AM", "2:15 PM", "6:00 PM"]
  },
  {
    id: 13,
    title: "Pranit More - Live Standup Comedy",
    genre: "Comedy / Observational",
    rating: "9.1/10",
    price: "₹499",
    posterUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=1500",
    certification: "UA",
    trailerUrl: "",
    type: "standup",
    trending: true,
    vibe: "Chill",
    showTime: ["8:30 PM"]
  },
  {
    id: 14,
    title: "Arijit Singh Symphony Concert",
    genre: "Musical / Bollywood Concert",
    rating: "9.8/10",
    price: "₹1999",
    posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1500",
    certification: "U",
    trailerUrl: "",
    type: "live-show",
    trending: true,
    vibe: "Vibrant",
    showTime: ["7:00 PM"]
  },
  {
    id: 15,
    title: "Anubhav Singh Bassi - Kisi Ko Batana Mat",
    genre: "Comedy / Storytelling",
    rating: "9.4/10",
    price: "₹799",
    posterUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=1500",
    certification: "UA",
    trailerUrl: "",
    type: "standup",
    trending: true,
    vibe: "Chill",
    showTime: ["6:00 PM", "9:00 PM"]
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB...');
    await Movie.deleteMany({});
    console.log('Cleared existing movies.');
    await Movie.insertMany(seedData);
    console.log('Seed insertion complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
