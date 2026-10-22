# CineMatch

CineMatch is a movie discovery app built with HTML, CSS, JavaScript, Express, MongoDB, and Mongoose.

## Features included
- Movie catalogue with title search and genre/language/year filters
- Movie details, posters, ratings, cast/director details, and genre-based recommendations
- Signup/login with bcrypt password hashing and JWT authentication
- Personal watchlist (add, view, remove)
- Watch history
- User reviews and ratings (one review per user per movie)
- Admin-protected movie create/update/delete API routes

## Setup

1. Install Node.js (LTS) if it is not already installed.
2. Open this folder in VS Code.
3. In the terminal, run:

   ```bash
   npm install
   ```

4. Create a `.env` file in this folder (do not commit or share it):

   ```env
   MONGO_URI=YOUR_EXISTING_MONGODB_ATLAS_CONNECTION_STRING
   OMDB_API_KEY=YOUR_OMDB_API_KEY
   JWT_SECRET=PASTE_A_RANDOM_SECRET_HERE
   ```

   Generate a JWT secret in the terminal:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Keep your existing MongoDB URI and OMDb key privately on your computer. Do not send them in screenshots or commit `.env` to GitHub.

5. Start the backend:

   ```bash
   npm start
   ```

6. Open `index.html` using VS Code Live Server. Keep the backend terminal running.

## Admin access
New signups are always assigned the `user` role. To create an administrator, register an account first, then change that user's `role` to `admin` directly in the `users` collection in MongoDB Atlas. Do not add a public admin-signup form.

## API endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/movies`
- `GET /api/watchlist`, `POST /api/watchlist/:movieId`, `DELETE /api/watchlist/:movieId`
- `GET /api/history`, `POST /api/history/:movieId`
- `GET /api/movies/:movieId/reviews`, `POST /api/movies/:movieId/reviews`
- Admin-only: `POST /api/movies`, `PUT /api/movies/:id`, `DELETE /api/movies/:id`

## Notes
- This is a college-project starter, not a production-hardened deployment. For a public deployment, configure CORS for your own frontend origin, use HTTPS, apply rate limiting to authentication endpoints, and consider httpOnly secure cookies rather than localStorage for tokens.
- The browser currently calls `http://localhost:3000`; for deployment, update `API_BASE` in `script.js` to your deployed API URL.
