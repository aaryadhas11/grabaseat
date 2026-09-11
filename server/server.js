const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Booking = require('./models/Booking');
const Movie = require('./models/Movie');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const crypto = require('crypto');

const getTrimmedEnv = (key, fallback) => {
  const val = process.env[key];
  return (val && val.trim()) ? val.trim() : fallback;
};

const razorpayInstance = new Razorpay({
  key_id: getTrimmedEnv('RAZORPAY_KEY_ID', 'dummy_key'),
  key_secret: getTrimmedEnv('RAZORPAY_KEY_SECRET', 'dummy_secret')
});

const app = express();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
  auth: {
    user: getTrimmedEnv('EMAIL_USER', process.env.EMAIL_USER),
    pass: getTrimmedEnv('EMAIL_PASS', process.env.EMAIL_PASS),
  },
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://grabaseat-2dnc.vercel.app",
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DATABASE LIVE'))
  .catch(err => console.error('❌ DB ERROR:', err.message));

// --- MOOD & VIBE EVALUATION HELPER ---
const MOOD_MAP = {
  romantic: ["romance", "romantic", "love", "heartfelt", "emotional", "passion", "couple", "drama", "nostalgic"],
  emotional: ["drama", "heartbreaking", "sad", "emotional", "touching", "tears", "romance", "family", "nostalgic"],
  thrilled: ["thriller", "mystery", "suspense", "crime", "action", "investigation", "twist"],
  excited: ["action", "adventure", "sci-fi", "superhero", "fast-paced", "energy", "vibrant"],
  cheerful: ["comedy", "humor", "fun", "family", "animation", "feel-good", "laugh", "chill"],
  intense: ["action", "war", "thriller", "dark", "crime", "revenge", "intense"],
  vibrant: ["vibrant", "action", "sci-fi", "musical", "concert", "energy"],
  chill: ["chill", "comedy", "relaxing", "casual", "fun", "humor"],
  nostalgic: ["nostalgic", "retro", "classic", "emotional", "drama", "romance"],
  comedy: ["comedy", "humor", "fun", "laugh", "standup"],
  horror: ["horror", "scary", "supernatural", "thriller", "dark"]
};

const filterMoviesByMood = (movies, selectedMood) => {
  if (!movies || !Array.isArray(movies) || movies.length === 0) return [];
  if (!selectedMood || selectedMood.trim().toLowerCase() === 'all') return movies;

  const normalizedMood = selectedMood.trim().toLowerCase();
  const moodKeywords = MOOD_MAP[normalizedMood] || [normalizedMood];

  const getSearchableText = (movie) => {
    const title = movie.title || '';
    const genre = Array.isArray(movie.genre) ? movie.genre.join(' ') : (movie.genre || '');
    const genres = Array.isArray(movie.genres) ? movie.genres.join(' ') : (movie.genres || '');
    const description = movie.description || movie.storyline || movie.synopsis || movie.plot || '';
    const vibe = Array.isArray(movie.vibe) ? movie.vibe.join(' ') : (movie.vibe || '');
    const vibes = Array.isArray(movie.vibes) ? movie.vibes.join(' ') : (movie.vibes || '');

    return `${title} ${genre} ${genres} ${description} ${vibe} ${vibes}`.trim().toLowerCase();
  };

  const primaryMatches = movies.filter(movie => {
    const fullText = getSearchableText(movie);
    return moodKeywords.some(keyword => fullText.includes(keyword.toLowerCase()));
  });

  if (primaryMatches.length > 0) return primaryMatches;

  const secondaryMatches = movies.filter(movie => {
    const fullText = getSearchableText(movie);
    return fullText.includes(normalizedMood);
  });

  if (secondaryMatches.length > 0) return secondaryMatches;

  return movies;
};

// --- MOVIES ---
app.get('/api/movies', async (req, res) => {
  try {
    let movies = await Movie.find({});
    const needsSeed = movies.length < 15 || movies.some(m => !m.showTime || m.showTime.length === 0);
    if (needsSeed) {
      await Movie.deleteMany({});
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
          showTime: ["09:30 AM", "12:15 PM", "03:30 PM", "06:00 PM", "08:45 PM", "11:15 PM"]
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
      await Movie.insertMany(seedData);
      movies = await Movie.find({});
    }

    const filterKeyword = req.query.vibe || req.query.mood;
    if (filterKeyword && filterKeyword.toLowerCase() !== 'all') {
      movies = filterMoviesByMood(movies, filterKeyword);
    }

    res.status(200).json(movies);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Dedicated Recommendation Route
app.get('/api/movies/recommend', async (req, res) => {
  try {
    const filterKeyword = req.query.vibe || req.query.mood || 'All';
    let movies = await Movie.find({});
    if (movies.length === 0) {
      movies = await Movie.find({});
    }
    const recommendations = filterMoviesByMood(movies, filterKeyword);
    res.status(200).json(recommendations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/recommendations', async (req, res) => {
  try {
    const filterKeyword = req.query.vibe || req.query.mood || 'All';
    let movies = await Movie.find({});
    const recommendations = filterMoviesByMood(movies, filterKeyword);
    res.status(200).json(recommendations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/movies', async (req, res) => {
  try { const m = new Movie(req.body); await m.save(); res.status(201).json(m); } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/movies/:id', async (req, res) => {
  try {
    const m = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return res.status(404).json({ error: "Movie not found" });
    res.status(200).json(m);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  try { await Movie.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Movie removed" }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- AUTH LOGIC ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, isLogin } = req.body;
    if (isLogin) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Account not found. Create one?" });
      if (user.password !== password) return res.status(401).json({ message: "Incorrect password." });
      const userObj = user.toObject();
      const emailLower = (user.email || '').toLowerCase();
      userObj.isAdmin = emailLower === "adminlogin11@gmail.com" || emailLower === "aaryanitindhas@gmail.com";
      return res.status(200).json({ message: "Welcome back!", user: userObj });
    } else {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      const newUser = new User({ name, email, password, wishlist: [] });
      await newUser.save();
      const userObj = newUser.toObject();
      const emailLower = (newUser.email || '').toLowerCase();
      userObj.isAdmin = emailLower === "adminlogin11@gmail.com" || emailLower === "aaryanitindhas@gmail.com";
      res.status(201).json({ message: "User created", user: userObj });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- FORGOT & RESET PASSWORD ---
const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) return res.status(400).json({ message: "Email is required." });

    const trimmedEmail = email.trim();
    const user = await User.findOne({ email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') } });
    
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    try {
      await transporter.sendMail({
        from: `"GrabASeat Support" <${getTrimmedEnv('EMAIL_USER')}>`,
        to: user.email,
        subject: "GrabASeat - Password Reset Link",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:550px;margin:0 auto;background:#111214;color:#fff;padding:30px;border-radius:16px;border:1px solid rgba(255,195,0,0.3)">
            <h2 style="margin:0 0 12px;text-align:center;font-size:1.8rem;letter-spacing:-0.5px">
              <span style="color:#FFFFFF">GrabA</span><span style="color:#E50914;text-shadow:0 0 10px rgba(229,9,20,0.45)">Seat</span>
            </h2>
            <p style="color:#ccc;font-size:0.95rem">Hello <strong>${user.name || 'User'}</strong>,</p>
            <p style="color:#aaa;font-size:0.9rem">You requested a password reset for your GrabASeat account. Click the button below to set a new password:</p>
            
            <div style="text-align:center;margin:25px 0">
              <a href="${resetUrl}" style="background:#FFC300;color:#000;padding:12px 28px;border-radius:30px;font-weight:bold;text-decoration:none;display:inline-block;font-size:0.95rem">
                RESET PASSWORD
              </a>
            </div>
            
            <p style="color:#777;font-size:0.8rem">If you did not request this, please ignore this email. Link expires in 1 hour.</p>
            <p style="color:#555;font-size:0.75rem;margin-top:20px;border-top:1px solid #222;padding-top:10px">Need help? Contact support@grabaseat.com</p>
          </div>
        `
      });
      res.status(200).json({ success: true, message: "Reset link sent to your email!" });
    } catch (mailErr) {
      console.error("Forgot Password Email Error:", mailErr.message);
      res.status(500).json({ message: "Error sending reset email. Please try again." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.trim().length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters long." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or expired." });
    }

    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/forgot-password', handleForgotPassword);
app.post('/api/auth/forgot-password', handleForgotPassword);

app.post('/api/reset-password/:token', handleResetPassword);
app.post('/api/auth/reset-password/:token', handleResetPassword);

// --- RAZORPAY ORDER ---
app.post('/api/payment/order', async (req, res) => {
  try {
    const { amount } = req.body;
    const amountInPaise = Math.round(Number(amount) * 100);
    const options = { amount: amountInPaise, currency: "INR", receipt: `rcpt_${Date.now()}` };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("RAZORPAY ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- BOOKING (Fixed Processing Hang & Email) ---
app.post('/api/book', async (req, res) => {
  try {
    const { email, movieId, movieTitle, selectedSeats, totalPrice, showTime, paymentId, theater, bookingDate } = req.body;

    const newBooking = new Booking({
      email,
      movieId,
      movieTitle,
      selectedSeats,
      totalPrice,
      showTime,
      paymentId,
      theater: theater || "GrabASeat Cinema",
      bookingDate: bookingDate || new Date().toLocaleDateString('en-IN')
    });
    await newBooking.save();

    // Fire-and-forget email
    (async () => {
      try {
        let qr = '';
        try { qr = await QRCode.toDataURL(newBooking._id.toString()); } catch (_) { }
        await transporter.sendMail({
          from: `"GrabASeat Tickets" <${getTrimmedEnv('EMAIL_USER')}>`,
          to: email,
          subject: `Your Tickets: ${movieTitle}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111214;color:#fff;padding:35px;border-radius:20px;text-align:center;border:1px solid rgba(255, 195, 0, 0.2)">
              <h1 style="letter-spacing:1px;margin:0 0 10px;font-weight:900;font-size:2rem">
                <span style="color:#FFFFFF">GrabA</span><span style="color:#E50914;text-shadow:0 0 12px rgba(229, 9, 20, 0.45)">Seat</span>
              </h1>
              <p style="color:#aaa;font-size:0.9rem;margin:0 0 25px">Thank you for booking with us! Here is your e-ticket.</p>
              
              <div style="background:#1c1d22;padding:25px;border:1px solid rgba(255,195,0,0.3);border-radius:12px;margin:20px 0;text-align:left">
                <h3 style="color:#FFC300;margin:0 0 15px;font-size:1.4rem;border-bottom:1px solid #333;padding-bottom:10px">${movieTitle}</h3>
                <p style="margin:8px 0;font-size:0.95rem"><strong>🏛️ Theater:</strong> ${newBooking.theater}</p>
                <p style="margin:8px 0;font-size:0.95rem"><strong>📅 Date:</strong> ${newBooking.bookingDate}</p>
                <p style="margin:8px 0;font-size:0.95rem"><strong>🕒 Showtime:</strong> ${showTime || "10:30 AM"}</p>
                <p style="margin:8px 0;font-size:0.95rem"><strong>💺 Seats:</strong> ${selectedSeats.join(', ')}</p>
                <p style="margin:8px 0;font-size:0.95rem"><strong>💰 Total Price:</strong> ₹${totalPrice}</p>
                <p style="margin:8px 0;font-size:0.95rem"><strong>💳 Payment ID:</strong> ${paymentId || "N/A"}</p>
              </div>
              
              ${qr ? `
                <div style="margin:25px 0">
                  <p style="color:#aaa;font-size:0.8rem;margin-bottom:10px">Scan at the counter to enter</p>
                  <img src="${qr}" alt="Ticket QR" style="border:4px solid #fff;border-radius:10px;width:160px;height:160px" />
                </div>
              ` : ''}
              
              <hr style="border:0;border-top:1px solid #222;margin:25px 0" />
              <p style="color:#666;font-size:0.75rem;margin:0">Enjoy the show! If you have queries, contact support@grabaseat.com</p>
            </div>
          `
        });
      } catch (emailErr) { console.error('Email failed:', emailErr.message); }
    })();

    // CRITICAL: Send JSON response to stop the frontend spinner
    res.status(201).json({ success: true, message: 'Booking saved!', booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- BOOKING QUERIES (Theater, Date & Showtime Scoped) ---
app.get('/api/bookings/:movieId', async (req, res) => {
  try {
    const { theater, date, bookingDate, showTime } = req.query;
    const query = { movieId: req.params.movieId };

    if (theater) query.theater = theater;
    if (date || bookingDate) query.bookingDate = date || bookingDate;
    if (showTime) query.showTime = showTime;

    const bookings = await Booking.find(query);
    res.status(200).json(bookings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/bookings/user/:email', async (req, res) => {
  try { res.status(200).json(await Booking.find({ email: req.params.email }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// --- FIXED WISHLIST TOGGLE ---
app.post('/api/wishlist/toggle', async (req, res) => {
  try {
    const { email, movieId } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const index = user.wishlist.indexOf(String(movieId));
    let action;
    if (index > -1) {
      user.wishlist.splice(index, 1); // Remove if exists
      action = 'removed';
    } else {
      user.wishlist.push(String(movieId)); // Add if doesn't
      action = 'added';
    }

    await user.save();
    res.status(200).json({ likedList: user.wishlist, action });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/wishlist/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ likedList: user.wishlist || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));