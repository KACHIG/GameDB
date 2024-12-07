apiKey = "rJ0HxvXQ6t4H1e2MXzzpXlhFmRfAyO83QAearWi1";

let uniqueNumbers = [5];
let findGame = 0;

function showGameResults() {
  document.getElementById("mainPage").style.visibility = "hidden";
  document.getElementById("gameInfo").style.visibility = "hidden";
  document.getElementById("gameResults").style.visibility = "visible";
};

function showGameInfo() {
  document.getElementById("mainPage").style.visibility = "hidden";
  document.getElementById("gameInfo").style.visibility = "visible";
  document.getElementById("gameResults").style.visibility = "hidden";
};

function backToMain() {
  document.getElementById("gameResults").style.visibility = "hidden";
  document.getElementById("gameInfo").style.visibility = "hidden";
  document.getElementById("mainPage").style.visibility = "visible";

  window.scrollTo({
    top: 0,
    behavior: 'smooth' 
  });
};

async function getCount() {
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", apiKey);
    myHeaders.append("Content-Type", "application/javascript");
  
    const raw = "";
  
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
  
    let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/games/count", requestOptions)
  
    let data = await response.json();
    return data.count;
  };

async function getCover(coverId) {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = "fields *; where id = " + coverId + ";";

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/covers", requestOptions)

  let data = await response.json();
  let imageId = data[0].image_id
  return 'https://images.igdb.com/igdb/image/upload/t_cover_big/' + imageId +'.jpg'
};
  
async function getRandomGame() {
    let gameCount = await getCount();
    findGame = Math.floor(Math.random() * gameCount) + 1;
    while (uniqueNumbers.includes(findGame)) {
      findGame = Math.floor(Math.random() * gameCount) + 1; // Generate random number between 1 and 100
    }
    uniqueNumbers.push(findGame);

    const myHeaders = new Headers();
    myHeaders.append("x-api-key", apiKey);
    myHeaders.append("Content-Type", "application/javascript");
  
    const raw = "fields *; where id = " + findGame + ";";
  
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
  
    let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/games", requestOptions)
  
    let data = await response.json();
    
    let cover = await getCover(data[0].cover);
    return cover
  };

async function gameSearch() {
  let searchQuery = document.getElementById("searchField").value.trim();
  console.log(searchQuery);
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = "where rating > 75; search \"" + searchQuery +"\"; fields name, cover;";
  console.log(raw);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/games", requestOptions)
  
  let data = await response.json();
  
  let resultsContainer = document.querySelector(".game-results-container");
  resultsContainer.innerHTML = "";

  if (data && data.length > 1) {
    // Loop through each game and dynamically create result items
    data.forEach(async (game) => {
      const resultItem = document.createElement("div");
      resultItem.className = "game-result-item";
      resultItem.style.cursor = "pointer"; // Add a pointer cursor to indicate it's clickable
  
      // Add a click event listener to call gameSelect with the game's ID
      resultItem.addEventListener("click", () => {
        gameSelect(game.id); // Pass the game's ID to the function
      });
  
      // Create and append the cover image
      const coverImage = document.createElement("img");
      try {
        if (game.cover) {
          coverImage.src = await getCover(game.cover); // Await the async getCover function
        } else {
          coverImage.src = "#"; // Fallback image
        }
      } catch (error) {
        console.error("Error fetching cover:", error);
        coverImage.src = "#"; // Fallback if there's an error
      }
      resultItem.appendChild(coverImage);
  
      // Create and append the game name
      const gameName = document.createElement("p");
      gameName.textContent = game.name || "Unknown Game"; // Fallback for game name
      resultItem.appendChild(gameName);
  
      // Append the result item to the results container
      resultsContainer.appendChild(resultItem);
    });
  } else {
    resultsContainer.innerHTML = "<p>No games found.</p>";
  }
  

  showGameResults();
};

async function gameSelect(gameId) {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = "fields cover, genres.*, name, platforms.*, rating, screenshots.*, summary, release_dates.*, involved_companies.*; where id = " + gameId + ";";

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/games", requestOptions)

  let data = await response.json();
  console.log(data);

  if (data && data.length === 1) {
    showGameInfo();
    const game = data[0];
    const gameInfoDiv = document.getElementById("gameInfo");

    if (gameInfoDiv) {
      // Ensure gameInfoDiv is visible
      gameInfoDiv.style.visibility = "visible";

      // Set game cover image
      const coverImage = document.getElementById("coverImage");
      if (coverImage && game.cover) {
        coverImage.src = await getCover(game.cover); // Assuming getCover is a function to fetch cover URL
      }

      // Set game title
      const title = document.getElementById("gameName");
      if (title) {
        title.textContent = game.name || "Unknown Game";
      }

      // Set game summary
      const summary = document.getElementById("gameSummary");
      if (summary) {
        summary.textContent = game.summary || "No summary available";
      }

      // Set release date
      const releaseDate = document.getElementById("releaseDate");
      if (releaseDate) {
        releaseDate.textContent = game.release_dates && game.release_dates[0] 
                                  ? game.release_dates[0].human
                                  : "Release date unknown";
      }

      // Set platform(s)
      const platform = document.getElementById("platform");
      if (platform) {
        platform.textContent = game.platforms && game.platforms.length
          ? game.platforms.map(p => p.abbreviation || p.name).join(", ")
          : "Platform unknown";
      }

      // Set developer
      const developer = document.getElementById("developer");
      if (developer) {
        developer.textContent = game.involved_companies
          ? game.involved_companies.find(c => c.publisher)?.company.name || "Unknown Developer"
          : "Unknown Developer";
      }

      // Set publisher
      const publisher = document.getElementById("publisher");
      if (publisher) {
        publisher.textContent = game.involved_companies
          ? game.involved_companies.find(c => c.developer)?.company.name || "Unknown Publisher"
          : "Unknown Publisher";
      }

      // Set genres
      const genres = document.getElementById("gameGenres");
      if (genres) {
        genres.textContent = game.genres && game.genres.length
          ? game.genres.join(", ")
          : "No genres available";
      }

      // Set ratings
      const ratings = document.getElementById("gameRatings");
      if (ratings) {
        ratings.textContent = game.rating ? `Rating: ${game.rating.toFixed(1)}` : "No rating available";
      }

      // Add screenshots
      const screenshotsContainer = document.getElementById("screenshots");
      if (screenshotsContainer) {
        screenshotsContainer.innerHTML = ""; // Clear any existing screenshots
        if (game.screenshots && game.screenshots.length > 0) {
          game.screenshots.forEach(screenshot => {
            const img = document.createElement("img");
            img.src = `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`;
            img.alt = "Game Screenshot";
            screenshotsContainer.appendChild(img);
          });
        } else {
          const noScreenshotsMessage = document.createElement("p");
          noScreenshotsMessage.textContent = "No screenshots available.";
          screenshotsContainer.appendChild(noScreenshotsMessage);
        }
      }
    } else {
      console.error("GameInfo div not found.");
    }
  } else {
    console.error("No data found for the selected game.");
  }
};

function displayCarousel() {
  getRandomGame().then(value => {
    document.getElementById("ci1").src = value
  });
  getRandomGame().then(value => {
    document.getElementById("ci2").src = value
  });
  getRandomGame().then(value => {
    document.getElementById("ci3").src = value
  });
  getRandomGame().then(value => {
    document.getElementById("ci4").src = value
  });
  getRandomGame().then(value => {
    document.getElementById("ci5").src = value
  });
};

displayCarousel();