/* =====================================================
   CineMatch — Complete Frontend Script
   ===================================================== */

// Empty means "same origin": the Express server also serves the frontend.
const API_BASE = "";
let movies = [];
let authMode = "login";
let editingMovieId = null;

/* ===== Main page elements ===== */

const movieList = document.getElementById("movie-list");
const searchInput = document.getElementById("search");
const genreSelect = document.getElementById("genre");
const languageSelect = document.getElementById("language");
const yearSelect = document.getElementById("year");
const detailsSection = document.getElementById("movie-details");
const detailsScreen = document.getElementById("movie-details-screen");
const heroSection = document.querySelector(".hero");

const catalogueHeading = [...document.querySelectorAll("main h2")]
  .find((heading) => heading.textContent.trim() === "Explore Movies");

function showCatalogue() {
  if (detailsScreen) detailsScreen.hidden = true;
  detailsSection.hidden = true;

  if (heroSection) heroSection.hidden = false;
  if (catalogueHeading) catalogueHeading.hidden = false;

  movieList.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===== Load movies ===== */

async function loadMovies() {
  try {
    movieList.textContent = "Loading movies...";

    const response = await fetch(`${API_BASE}/api/movies`);

    if (!response.ok) {
      throw new Error("Could not load movies.");
    }

    movies = await response.json();

    populateYearFilter();
    displayMovies();
  } catch (error) {
    console.error("Error loading movies:", error);
    movieList.textContent =
      "Could not load movies. Please check whether the backend is running.";
  }
}

/* ===== Year filter ===== */

function populateYearFilter() {
  const years = [
    ...new Set(movies.map((movie) => movie.year).filter(Boolean))
  ].sort((a, b) => b - a);

  const previousYear = yearSelect.value;

  yearSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All release years";
  yearSelect.appendChild(allOption);

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  });

  yearSelect.value =
    previousYear === "All" ||
    years.some((year) => String(year) === previousYear)
      ? previousYear
      : "All";
}

/* ===== Movie catalogue and filters ===== */

function displayMovies() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedGenre = genreSelect.value;
  const selectedLanguage = languageSelect.value;
  const selectedYear = yearSelect.value;

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = (movie.title || "")
      .toLowerCase()
      .includes(searchText);

    const movieGenres = [
      movie.genre,
      ...(Array.isArray(movie.genres) ? movie.genres : [])
    ]
      .filter(Boolean)
      .map((genre) => genre.toLowerCase());

    const matchesGenre =
      selectedGenre === "All" ||
      movieGenres.includes(selectedGenre.toLowerCase());

    const matchesLanguage =
      selectedLanguage === "All" ||
      (movie.language || "").toLowerCase() ===
        selectedLanguage.toLowerCase();

    const matchesYear =
      selectedYear === "All" ||
      String(movie.year) === selectedYear;

    return (
      matchesSearch &&
      matchesGenre &&
      matchesLanguage &&
      matchesYear
    );
  });

  movieList.innerHTML = "";

  if (!filteredMovies.length) {
    movieList.textContent =
      "No movies found. Try changing your search or filters.";
    return;
  }

  filteredMovies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "movie-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View details for ${movie.title}`);

    const poster = document.createElement("img");
    poster.className = "movie-poster";
    poster.alt = `${movie.title} poster`;
    poster.loading = "lazy";
    poster.referrerPolicy = "no-referrer";

    poster.onerror = () => {
      poster.onerror = null;

      const placeholder = document.createElement("div");
      placeholder.className = "movie-poster-placeholder";
      placeholder.textContent = "🎬";
      placeholder.setAttribute(
        "aria-label",
        `Poster unavailable for ${movie.title}`
      );

      poster.replaceWith(placeholder);
    };

    poster.src =
      typeof movie.poster === "string" && movie.poster.trim()
        ? movie.poster.trim()
        : "https://placehold.co/300x450/211a38/ffffff?text=Poster+Unavailable";

    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const details = document.createElement("p");
    details.textContent =
      `${movie.year || "Year unknown"} · ${movie.genre || "Genre unknown"}`;

    const rating = document.createElement("p");
    rating.className = "movie-rating";
    rating.textContent =
      `⭐ ${Number(movie.rating || 0).toFixed(1)}/10`;

    const hint = document.createElement("p");
    hint.className = "movie-description";
    hint.textContent = "Click to explore →";

    info.append(title, details, rating, hint);

    const actions = document.createElement("div");
    actions.className = "movie-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "♡ Save";

    saveButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await addToWatchlist(movie._id);
    });

    actions.appendChild(saveButton);
    info.appendChild(actions);
    card.append(poster, info);

    card.addEventListener("click", () => showMovieDetails(movie));

    card.addEventListener("keydown", (event) => {
      if (event.target !== card) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showMovieDetails(movie);
      }
    });

    movieList.appendChild(card);
  });
}

/* ===== Separate movie details screen ===== */

function showMovieDetails(movie) {
  if (heroSection) heroSection.hidden = true;
  if (catalogueHeading) catalogueHeading.hidden = true;
  movieList.hidden = true;

  if (detailsScreen) detailsScreen.hidden = false;

  detailsSection.hidden = false;
  detailsSection.innerHTML = "";
  detailsSection.className = "details-panel";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "secondary-button details-close";
  backButton.textContent = "← Back to Explore Movies";
  backButton.addEventListener("click", showCatalogue);

  // Poster and information side by side.
  const detailsHero = document.createElement("div");
  detailsHero.className = "details-hero";

  const detailsInfo = document.createElement("div");
  detailsInfo.className = "details-info";

  const poster = document.createElement("img");
  poster.className = "details-poster";
  poster.alt = `${movie.title} movie poster`;
  poster.loading = "eager";
  poster.referrerPolicy = "no-referrer";

  function showPosterPlaceholder() {
    const placeholder = document.createElement("div");
    placeholder.className = "details-poster-placeholder";
    placeholder.textContent = "🎬";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute(
      "aria-label",
      `No poster available for ${movie.title}`
    );
    poster.replaceWith(placeholder);
  }

  poster.addEventListener("error", showPosterPlaceholder, { once: true });

  if (typeof movie.poster === "string" && movie.poster.trim()) {
    poster.src = movie.poster.trim();
  } else {
    showPosterPlaceholder();
  }

  const heading = document.createElement("h2");
  heading.textContent = movie.title;

  const metadata = document.createElement("p");
  metadata.className = "details-metadata";

  const metadataParts = [
    movie.year || "Year unknown",
    movie.genre || "Genre unknown",
    `⭐ ${Number(movie.rating || 0).toFixed(1)}/10`
  ];

  if (movie.language) metadataParts.push(movie.language);
  if (movie.duration) metadataParts.push(`${movie.duration} minutes`);

  metadata.textContent = metadataParts.join(" · ");

  const description = document.createElement("p");
  description.className = "details-description";
  description.textContent =
    movie.description || "Description coming soon.";

  const director = document.createElement("p");
  if (movie.director) {
    director.textContent = `Director: ${movie.director}`;
  }

  const cast = document.createElement("p");
  if (Array.isArray(movie.cast) && movie.cast.length) {
    cast.textContent = `Cast: ${movie.cast.join(", ")}`;
  }

  // Watchlist and watch history.
  const detailActions = document.createElement("div");
  detailActions.className = "movie-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "♡ Add to watchlist";
  saveButton.addEventListener("click", () => addToWatchlist(movie._id));

  const watchedButton = document.createElement("button");
  watchedButton.type = "button";
  watchedButton.textContent = "✓ Mark as watched";
  watchedButton.addEventListener("click", () => addToHistory(movie._id));

  detailActions.append(saveButton, watchedButton);

  detailsInfo.append(heading, metadata, description);

  if (movie.director) detailsInfo.appendChild(director);

  if (Array.isArray(movie.cast) && movie.cast.length) {
    detailsInfo.appendChild(cast);
  }

  detailsInfo.appendChild(detailActions);
  detailsHero.append(poster, detailsInfo);

  // Recommendations based on shared genres.
  const currentGenres = [
    movie.genre,
    ...(Array.isArray(movie.genres) ? movie.genres : [])
  ]
    .filter(Boolean)
    .map((genre) => genre.toLowerCase());

  const recommendations = movies
    .filter((other) => {
      if (String(other._id) === String(movie._id)) return false;

      const otherGenres = [
        other.genre,
        ...(Array.isArray(other.genres) ? other.genres : [])
      ]
        .filter(Boolean)
        .map((genre) => genre.toLowerCase());

      return currentGenres.some((genre) =>
        otherGenres.includes(genre)
      );
    })
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 4);

  const recommendationsHeading = document.createElement("h3");
  recommendationsHeading.className = "details-section-heading";
  recommendationsHeading.textContent = "You might also like";

  const recommendationList = document.createElement("div");
  recommendationList.className = "recommendation-list";

  if (!recommendations.length) {
    const message = document.createElement("p");
    message.textContent =
      "No similar movies yet. Add more movies to your catalogue!";
    recommendationList.appendChild(message);
  } else {
    recommendations.forEach((other) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recommendation-button";
      button.textContent =
        `${other.title} · ⭐ ${Number(other.rating || 0).toFixed(1)}/10`;

      button.addEventListener("click", () => {
        showMovieDetails(other);
      });

      recommendationList.appendChild(button);
    });
  }

  // Community reviews.
  const reviewHeading = document.createElement("h3");
  reviewHeading.className = "details-section-heading";
  reviewHeading.textContent = "Community reviews";

  const reviewArea = document.createElement("div");
  reviewArea.id = `reviews-for-${movie._id}`;
  loadReviews(movie._id, reviewArea);

  // Review form.
  const reviewForm = document.createElement("form");
  reviewForm.className = "review-form";

  const reviewFormHeading = document.createElement("h3");
  reviewFormHeading.textContent = "Rate this movie";

  const ratingSelect = document.createElement("select");
  ratingSelect.required = true;
  ratingSelect.setAttribute("aria-label", "Your rating out of 10");

  for (let score = 10; score >= 1; score--) {
    const option = document.createElement("option");
    option.value = String(score);
    option.textContent = `${score}/10`;
    ratingSelect.appendChild(option);
  }

  const reviewText = document.createElement("textarea");
  reviewText.maxLength = 1000;
  reviewText.placeholder =
    "Write a review (optional, up to 1000 characters)";

  const reviewSubmit = document.createElement("button");
  reviewSubmit.className = "primary-button";
  reviewSubmit.type = "submit";
  reviewSubmit.textContent = "Submit review";

  const reviewStatus = document.createElement("p");
  reviewStatus.setAttribute("role", "status");

  reviewForm.append(
    reviewFormHeading,
    ratingSelect,
    reviewText,
    reviewSubmit,
    reviewStatus
  );

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      reviewStatus.textContent = "Please log in to leave a review.";
      openAuth("login");
      return;
    }

    reviewSubmit.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE}/api/movies/${movie._id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: Number(ratingSelect.value),
            text: reviewText.value
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit review.");
      }

      reviewStatus.textContent = "Review saved!";
      reviewText.value = "";

      await loadReviews(movie._id, reviewArea);
      await loadMovies();
    } catch (error) {
      reviewStatus.textContent = error.message;
    } finally {
      reviewSubmit.disabled = false;
    }
  });

  detailsSection.append(
    backButton,
    detailsHero,
    recommendationsHeading,
    recommendationList,
    reviewHeading,
    reviewArea,
    reviewForm
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===== Search and filter events ===== */

searchInput.addEventListener("input", displayMovies);
genreSelect.addEventListener("change", displayMovies);
languageSelect.addEventListener("change", displayMovies);
yearSelect.addEventListener("change", displayMovies);

/* ===== Authentication elements ===== */

const authPanel = document.getElementById("auth-panel");
const authForm = document.getElementById("auth-form");
const authName = document.getElementById("auth-name");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authMessage = document.getElementById("auth-message");
const authSubmit = document.getElementById("auth-submit");
const nameLabel = document.getElementById("name-label");
const accountStatus = document.getElementById("account-status");
const showAuthButton = document.getElementById("show-auth");
const logoutButton = document.getElementById("logout-button");
const adminDashboardButton =
  document.getElementById("admin-dashboard-button");
const adminPanel = document.getElementById("admin-panel");
const userTools = document.getElementById("user-tools");
const personalList = document.getElementById("personal-list");

function getToken() {
  return localStorage.getItem("cinematch_token");
}

function openAuth(mode = "login") {
  authMode = mode;
  authPanel.hidden = false;
  authMessage.textContent = "";

  const signup = mode === "signup";

  authTitle.textContent = signup
    ? "Create your account"
    : "Welcome back";

  authSubtitle.textContent = signup
    ? "Join CineMatch to save films and review favourites."
    : "Log in to save films and write reviews.";

  authName.hidden = !signup;
  nameLabel.hidden = !signup;
  authName.required = signup;

  authPassword.autocomplete = signup
    ? "new-password"
    : "current-password";

  authSubmit.textContent = signup ? "Create account" : "Log in";

  document.getElementById("login-tab")
    .classList.toggle("active", !signup);

  document.getElementById("signup-tab")
    .classList.toggle("active", signup);

  authPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateAccountUI(user) {
  if (user) {
    accountStatus.textContent = `Signed in as ${user.name}`;
    showAuthButton.hidden = true;
    logoutButton.hidden = false;
    userTools.hidden = false;
    adminDashboardButton.hidden = user.role !== "admin";

    if (user.role !== "admin") adminPanel.hidden = true;
  } else {
    accountStatus.textContent = "You're browsing as a guest";
    showAuthButton.hidden = false;
    logoutButton.hidden = true;
    adminDashboardButton.hidden = true;
    adminPanel.hidden = true;
    userTools.hidden = true;
    personalList.hidden = true;
  }
}

async function checkSession() {
  const token = getToken();

  if (!token) {
    updateAccountUI(null);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Session expired");

    updateAccountUI(data.user);
  } catch {
    localStorage.removeItem("cinematch_token");
    updateAccountUI(null);
  }
}

showAuthButton.addEventListener("click", () => openAuth("login"));

document.getElementById("close-auth").addEventListener("click", () => {
  authPanel.hidden = true;
});

document.getElementById("login-tab").addEventListener("click", () => {
  openAuth("login");
});

document.getElementById("signup-tab").addEventListener("click", () => {
  openAuth("signup");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  authSubmit.disabled = true;
  authMessage.textContent = "Please wait...";

  try {
    const payload = {
      email: authEmail.value.trim(),
      password: authPassword.value
    };

    if (authMode === "signup") {
      payload.name = authName.value.trim();
    }

    const response = await fetch(`${API_BASE}/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication failed.");
    }

    localStorage.setItem("cinematch_token", data.token);
    authPassword.value = "";
    authMessage.textContent = data.message;

    updateAccountUI(data.user);

    setTimeout(() => {
      authPanel.hidden = true;
    }, 700);
  } catch (error) {
    authMessage.textContent = error.message;
  } finally {
    authSubmit.disabled = false;
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("cinematch_token");
  updateAccountUI(null);
  personalList.hidden = true;
  adminPanel.hidden = true;
  authPanel.hidden = true;
});

/* ===== Watchlist and history actions ===== */

async function addToWatchlist(movieId) {
  const token = getToken();

  if (!token) {
    openAuth("login");
    authMessage.textContent = "Please log in to save movies.";
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/watchlist/${movieId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save movie.");
    }

    alert(data.message);
  } catch (error) {
    alert(error.message);
  }
}

async function addToHistory(movieId) {
  const token = getToken();

  if (!token) {
    openAuth("login");
    authMessage.textContent =
      "Please log in to track your watch history.";
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/history/${movieId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update history.");
    }

    alert(data.message);
  } catch (error) {
    alert(error.message);
  }
}

async function showPersonalList(type) {
  if (!getToken()) {
    openAuth("login");
    return;
  }

  personalList.hidden = false;
  personalList.innerHTML = "<p>Loading...</p>";

  const endpoint =
    type === "watchlist" ? "/api/watchlist" : "/api/history";

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load list.");
    }

    const items =
      type === "watchlist"
        ? data
        : data.map((entry) => entry.movie);

    personalList.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent =
      type === "watchlist" ? "My watchlist" : "My watch history";

    personalList.appendChild(heading);

    if (!items.length) {
      const empty = document.createElement("p");

      empty.textContent =
        type === "watchlist"
          ? "Your watchlist is empty. Save a movie to see it here."
          : "No watched movies recorded yet.";

      personalList.appendChild(empty);
    }

    items.filter(Boolean).forEach((movie) => {
      const row = document.createElement("div");
      row.className = "personal-movie";

      const label = document.createElement("span");
      label.textContent = `${movie.title} (${movie.year})`;

      const actions = document.createElement("div");
      actions.className = "movie-actions";

      const detailsButton = document.createElement("button");
      detailsButton.type = "button";
      detailsButton.textContent = "View details";
      detailsButton.addEventListener("click", () => {
        showMovieDetails(movie);
      });

      actions.appendChild(detailsButton);

      if (type === "watchlist") {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", async () => {
          try {
            const removeResponse = await fetch(
              `${API_BASE}/api/watchlist/${movie._id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${getToken()}`
                }
              }
            );

            const removeData = await removeResponse.json();

            if (!removeResponse.ok) {
              throw new Error(
                removeData.message || "Could not remove movie."
              );
            }

            await showPersonalList("watchlist");
          } catch (error) {
            alert(error.message);
          }
        });

        actions.appendChild(removeButton);
      }

      row.append(label, actions);
      personalList.appendChild(row);
    });

    personalList.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    personalList.textContent = error.message;
  }
}

document.getElementById("show-watchlist").addEventListener("click", () => {
  showPersonalList("watchlist");
});

document.getElementById("show-history").addEventListener("click", () => {
  showPersonalList("history");
});

document.getElementById("show-all-movies").addEventListener("click", () => {
  personalList.hidden = true;
  showCatalogue();
});

/* ===== Community reviews ===== */

async function loadReviews(movieId, target) {
  target.innerHTML = "<p>Loading reviews...</p>";

  try {
    const response = await fetch(
      `${API_BASE}/api/movies/${movieId}/reviews`
    );

    const reviews = await response.json();

    if (!response.ok) {
      throw new Error("Could not load reviews.");
    }

    target.innerHTML = "";

    if (!reviews.length) {
      target.textContent =
        "No reviews yet. Be the first to review this movie!";
      return;
    }

    reviews.forEach((review) => {
      const item = document.createElement("div");
      item.className = "review-item";

      const heading = document.createElement("strong");
      heading.textContent =
        `${review.user?.name || "CineMatch user"} · ${review.rating}/10`;

      const body = document.createElement("p");
      body.textContent = review.text || "No written comment.";

      item.append(heading, body);
      target.appendChild(item);
    });
  } catch {
    target.textContent = "Could not load reviews.";
  }
}

/* ===== Admin dashboard ===== */

const adminMovieForm = document.getElementById("admin-movie-form");
const adminMovieList = document.getElementById("admin-movie-list");
const adminMessage = document.getElementById("admin-message");
const adminSaveButton = document.getElementById("admin-save-movie");
const adminCancelEditButton =
  document.getElementById("admin-cancel-edit");
const adminFormTitle = document.getElementById("admin-form-title");
const adminMovieCount = document.getElementById("admin-movie-count");

function adminHeaders(json = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };

  if (json) headers["Content-Type"] = "application/json";

  return headers;
}

function adminSetMessage(message, isError = false) {
  adminMessage.textContent = message;
  adminMessage.style.color = isError ? "#ff9b9b" : "#d8caff";
}

function resetAdminForm() {
  editingMovieId = null;
  adminMovieForm.reset();

  document.getElementById("admin-movie-rating").value = "0";
  adminFormTitle.textContent = "Add a movie";
  adminSaveButton.textContent = "Add movie";
  adminCancelEditButton.hidden = true;

  adminSetMessage("");
}

function getAdminFormPayload() {
  const value = (id) =>
    document.getElementById(id).value.trim();

  const durationValue = value("admin-movie-duration");

  return {
    title: value("admin-movie-title"),
    genre: value("admin-movie-genre"),
    genres: value("admin-movie-genres")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    year: Number(value("admin-movie-year")),
    rating: Number(value("admin-movie-rating") || 0),
    language: value("admin-movie-language"),
    duration: durationValue ? Number(durationValue) : null,
    poster: value("admin-movie-poster"),
    director: value("admin-movie-director"),
    cast: value("admin-movie-cast")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    description: value("admin-movie-description")
  };
}

function fillAdminForm(movie) {
  editingMovieId = movie._id;

  const set = (id, value) => {
    document.getElementById(id).value = value ?? "";
  };

  set("admin-movie-title", movie.title);
  set("admin-movie-genre", movie.genre);
  set("admin-movie-genres", (movie.genres || []).join(", "));
  set("admin-movie-year", movie.year);
  set("admin-movie-rating", movie.rating ?? 0);
  set("admin-movie-language", movie.language);
  set("admin-movie-duration", movie.duration);
  set("admin-movie-poster", movie.poster);
  set("admin-movie-director", movie.director);
  set("admin-movie-cast", (movie.cast || []).join(", "));
  set("admin-movie-description", movie.description);

  adminFormTitle.textContent = `Edit: ${movie.title}`;
  adminSaveButton.textContent = "Save changes";
  adminCancelEditButton.hidden = false;

  adminSetMessage("Editing this movie. Save changes when you're ready.");

  adminMovieForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function loadAdminMovies() {
  if (!getToken()) return;

  adminMovieList.textContent = "Loading catalogue…";

  try {
    const response = await fetch(`${API_BASE}/api/movies`, {
      headers: adminHeaders()
    });

    const catalogue = await response.json();

    if (!response.ok) {
      throw new Error(catalogue.message || "Could not load movies.");
    }

    adminMovieCount.textContent = catalogue.length;
    adminMovieList.innerHTML = "";

    if (!catalogue.length) {
      adminMovieList.textContent = "No movies found in the catalogue.";
      return;
    }

    catalogue.forEach((movie) => {
      const row = document.createElement("div");
      row.className = "admin-movie-row";

      const details = document.createElement("div");
      details.className = "admin-movie-summary";

      const title = document.createElement("strong");
      title.textContent = movie.title;

      const meta = document.createElement("span");
      meta.textContent =
        `${movie.year} · ${movie.genre || "Uncategorised"} · ${movie.rating ?? 0}/10`;

      details.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "admin-row-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "secondary-button";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => fillAdminForm(movie));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger-button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => deleteAdminMovie(movie));

      actions.append(edit, remove);
      row.append(details, actions);
      adminMovieList.appendChild(row);
    });
  } catch (error) {
    adminMovieList.textContent = error.message;
  }
}

async function deleteAdminMovie(movie) {
  const confirmed = confirm(
    `Delete "${movie.title}" from CineMatch? This also removes its reviews and watchlist/history references.`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE}/api/movies/${movie._id}`,
      {
        method: "DELETE",
        headers: adminHeaders()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not delete movie.");
    }

    if (editingMovieId === movie._id) resetAdminForm();

    adminSetMessage(`Deleted "${movie.title}".`);

    await loadAdminMovies();
    await loadMovies();
  } catch (error) {
    adminSetMessage(error.message, true);
  }
}

adminDashboardButton.addEventListener("click", async () => {
  adminPanel.hidden = false;
  detailsSection.hidden = true;

  if (detailsScreen) detailsScreen.hidden = true;

  personalList.hidden = true;
  adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  await loadAdminMovies();
});

document.getElementById("close-admin-dashboard")
  .addEventListener("click", () => {
    adminPanel.hidden = true;
    showCatalogue();
  });

document.getElementById("admin-refresh-movies")
  .addEventListener("click", loadAdminMovies);

adminCancelEditButton.addEventListener("click", resetAdminForm);

adminMovieForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!getToken()) {
    adminSetMessage("Please log in as an administrator.", true);
    return;
  }

  const payload = getAdminFormPayload();

  if (
    !payload.title ||
    !payload.genre ||
    !Number.isInteger(payload.year) ||
    payload.year < 1888 ||
    payload.year > 2100 ||
    payload.rating < 0 ||
    payload.rating > 10
  ) {
    adminSetMessage(
      "Enter a title, genre, valid release year, and rating between 0 and 10.",
      true
    );
    return;
  }

  adminSaveButton.disabled = true;

  adminSetMessage(
    editingMovieId ? "Saving changes…" : "Adding movie…"
  );

  try {
    const isEditing = Boolean(editingMovieId);

    const response = await fetch(
      `${API_BASE}/api/movies${isEditing ? `/${editingMovieId}` : ""}`,
      {
        method: isEditing ? "PUT" : "POST",
        headers: adminHeaders(true),
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save movie.");
    }

    adminSetMessage(
      isEditing
        ? "Movie updated successfully!"
        : "Movie added successfully!"
    );

    resetAdminForm();

    await loadAdminMovies();
    await loadMovies();
  } catch (error) {
    adminSetMessage(error.message, true);
  } finally {
    adminSaveButton.disabled = false;
  }
});

/* ===== Screen navigation ===== */

function showCineMatchScreen(screenId) {
  if (screenId === "movie-details-screen") {
    return;
  }

  if (screenId === "explore-screen" || screenId === "home-screen") {
    showCatalogue();
    return;
  }

  if (detailsScreen) detailsScreen.hidden = true;
  detailsSection.hidden = true;

  const screen = document.getElementById(screenId);

  if (screen) {
    screen.hidden = false;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("back-to-movies")?.addEventListener(
  "click",
  showCatalogue
);

/* ===== Start the application ===== */

loadMovies();
checkSession();