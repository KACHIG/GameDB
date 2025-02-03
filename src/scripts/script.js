apiKey = ""; //Enter your own API Key
apiGateway = "" //Enter your own API Gateway

const gamesForRandom = ["mario", "zelda", "doom", "xenoblade", "xenosaga", "xenogears", "trails in the sky", "trails to azure", "tekken", "street fighter", "guilty gear", "yakuza", "half life", "Ys", "sonic", "metal gear", "fire emblem", "mega man"]

let usedGames = []

//These three functions changes the visibility of each 'layer'
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
    behavior: 'instant' 
  });
};

// Get the lightbox elements
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeButton = document.querySelector(".close");

// Add click event listeners to screenshots
document.querySelectorAll(".screenshot").forEach((image) => {
  image.addEventListener("click", () => {
    lightbox.style.display = "flex"; // Show the lightbox
    lightboxImage.src = image.src; // Set the lightbox image
    lightboxImage.alt = image.alt;
  });
});

// Close the lightbox when the close button is clicked
closeButton.addEventListener("click", () => {
  lightbox.style.display = "none"; // Hide the lightbox
});

// Close the lightbox when clicking outside the image
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.style.display = "none";
  }
});

//This function searches through the API to return a URL with the cover image
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

  let response = await fetch("https://" + apiGateway + ".execute-api.us-west-2.amazonaws.com/production/v4/covers", requestOptions)

  let data = await response.json();
  let imageId = data[0].image_id
  return 'https://images.igdb.com/igdb/image/upload/t_cover_big/' + imageId +'.jpg'
};

//This function looks through the API using a company ID to retrieve the company name
async function getCompany(companyId) {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = "fields developed, published, name; where id = " + companyId + ";";

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://" + apiGateway + ".execute-api.us-west-2.amazonaws.com/production/v4/companies", requestOptions)

  let data = await response.json();
  return data[0]
};
 
async function getRandomGame() {
  // Ensure no duplicates and select a random game
  const availableGames = gamesForRandom.filter(game => !usedGames.includes(game));
  if (availableGames.length === 0) {
    console.log("All games have been used!");
    return null;
  }

  // Pick a random game from available games
  const randomIndex = Math.floor(Math.random() * availableGames.length);
  const searchQuery = availableGames[randomIndex];

  // Append the selected game to usedGames
  usedGames.push(searchQuery);

  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = `where rating > 75; search "${searchQuery}"; fields name, cover; limit 50;`;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(
      "https://" + apiGateway + ".execute-api.us-west-2.amazonaws.com/production/v4/games",
      requestOptions
    );

    const data = await response.json();

    if (data && data.length > 0) {
      // Limit random selection to up to 10 games or fewer
      const randomGameIndex = Math.floor(Math.random() * data.length);

      // Retrieve the cover image URL
      const game = data[randomGameIndex];
      const coverUrl = await getCover(game.cover);

      // Return the game object with the cover URL
      return {
        id: game.id,
        name: game.name,
        cover: coverUrl
      };
    } else {
      console.error("No game data found for the query:", searchQuery);
      return null;
    }
  } catch (error) {
    console.error("Error fetching random game:", error);
    return null;
  }
}

//This function lets you search a keyword and it will pull back a list of results from the API
async function gameSearch() {
  let searchQuery = document.getElementById("searchField").value.trim();
  console.log(searchQuery);
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = "where rating > 75; search \"" + searchQuery +"\"; fields name, cover, summary;";
  console.log(raw);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://" + apiGateway + ".execute-api.us-west-2.amazonaws.com/production/v4/games", requestOptions)
  
  let data = await response.json();
  
  let resultsContainer = document.querySelector(".game-results-container");
  resultsContainer.innerHTML = "";

  if (data && data.length > 1) {
    // Loop through each game and dynamically create result items
    data.forEach(async (game) => {
        const resultItem = document.createElement("div");
        resultItem.className = "game-result-item p-3 border rounded shadow-sm mb-4 d-flex align-items-center justify-content-center"; // Flexbox for centering
        resultItem.style.cursor = "pointer"; // Add a pointer cursor to indicate it's clickable

        // Add a click event listener to call gameSelect with the game's ID
        resultItem.addEventListener("click", () => {
            gameSelect(game.id); // Pass the game's ID to the function
        });

        // Create and append the cover image
        const coverImage = document.createElement("img");
        coverImage.className = "img-fluid mb-3 me-3"; // Bootstrap classes for image responsiveness and margin-right
        try {
            if (game.cover) {
                coverImage.src = await getCover(game.cover); // Await the async getCover function
            } else {
                coverImage.src = "#"; // Fallback image if no cover exists
            }
        } catch (error) {
            console.error("Error fetching cover:", error);
            coverImage.src = "#"; // Fallback if there's an error
        }
        resultItem.appendChild(coverImage);

        // Create and append the game name (title)
        const gameDetails = document.createElement("div");
        gameDetails.className = "game-details d-flex flex-column"; // Flex column for title and summary alignment

        const gameName = document.createElement("h5");
        gameName.className = "game-title mb-2"; // Class for the title
        gameName.textContent = game.name || "Unknown Game"; // Fallback for game name
        gameDetails.appendChild(gameName);

        // Create and append the game summary
        const gameSummary = document.createElement("p");
        gameSummary.className = "game-summary"; // Class for the summary
        gameSummary.textContent = game.summary || "No summary available."; // Fallback for game summary
        gameDetails.appendChild(gameSummary);

        resultItem.appendChild(gameDetails);

        // Append the result item to the results container
        resultsContainer.appendChild(resultItem);
    });
  } else {
      resultsContainer.innerHTML = "<p>No games found.</p>";
  }

  showGameResults();
};

//This function is to update the game info page with the games developer abd publisher
async function updateCompanyInfo(game) {
  const developerElement = document.getElementById("developer");
  const publisherElement = document.getElementById("publisher");

  if (!game.involved_companies?.length) {
    developerElement.textContent = "Unknown Developer";
    publisherElement.textContent = "Unknown Publisher";
    return;
  }

  const promises = game.involved_companies.map(async (company) => {
    const companyData = await getCompany(company.company);
    if (companyData) {
      return {
        name: companyData.name,
        isDeveloper: companyData.developed?.includes(game.id),
        isPublisher: companyData.published?.includes(game.id),
      };
    }
    return null;
  });

  const companies = (await Promise.all(promises)).filter(Boolean);

  const developer = companies.find((c) => c.isDeveloper);
  const publisher = companies.find((c) => c.isPublisher);

  developerElement.textContent = developer?.name || "Unknown Developer";
  publisherElement.textContent = publisher?.name || "Unknown Publisher";
}

//The gameSelect function will call back to functions to populate the game info page with a cover, description, screenshots and other useful info about the game
async function gameSelect(gameId) {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", apiKey);
  myHeaders.append("Content-Type", "application/javascript");

  const raw = "fields cover, genres.*, name, platforms.*, rating, screenshots.*, summary, release_dates.*, involved_companies.company; where id = " + gameId + ";";

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://" + apiGateway + ".execute-api.us-west-2.amazonaws.com/production/v4/games", requestOptions)

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

      // Set companies
      updateCompanyInfo(game);

      // Set genres
      const genres = document.getElementById("gameGenres");
      genres.textContent =
        game.genres && game.genres.length > 0
          ? game.genres.map((g) => g.name).join(", ")
          : "No genres available";

      // Set ratings
      const ratings = document.getElementById("gameRatings");
      if (ratings) {
        ratings.textContent = game.rating ? `${game.rating.toFixed(1)}` : "No rating available";
      }

      // Add screenshots
      const screenshotsContainer = document.getElementById("screenshots");
      if (screenshotsContainer) {
        // Clear any existing content in the container
        screenshotsContainer.innerHTML = "";

        if (game.screenshots && game.screenshots.length > 0) {
          game.screenshots.forEach((screenshot) => {
            // Create image element for each screenshot
            const img = document.createElement("img");
            img.src = `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`;
            img.alt = "Game Screenshot";
            img.className = "screenshot";
            img.style.cursor = "pointer"; // Indicate clickable

            // Append the image to the container
            screenshotsContainer.appendChild(img);
          });
        } else {
          // Add a fallback message if no screenshots are available
          const noScreenshotsMessage = document.createElement("p");
          noScreenshotsMessage.textContent = "No screenshots available.";
          noScreenshotsMessage.className = "no-screenshots-message"; // Add a unique class
          screenshotsContainer.appendChild(noScreenshotsMessage);
        }
      }

      // Attach click listener to all images with the "screenshot" class
      document.querySelectorAll(".screenshot").forEach((image) => {
        image.addEventListener("click", () => {
          document.getElementById("lightbox").style.visibility = "visible";
          lightbox.style.display = "flex"; // Show the lightbox
          lightboxImage.src = image.src; // Set the lightbox image
          lightboxImage.alt = image.alt; // Set the alt text for accessibility
        });
      });

        window.scrollTo({
          top: 0,
          behavior: 'smooth' 
        });
    } else {
      console.error("GameInfo div not found.");
    }
  } else {
    console.error("No data found for the selected game.");
  }
};

//This function will display the random games on the front page
async function displayCarousel() {
  const carouselIds = ["game-image-1", "game-image-2", "game-image-3", "game-image-4", "game-image-5", "game-image-6"];
  const nameIds = ["game-name-1", "game-name-2", "game-name-3", "game-name-4", "game-name-5", "game-name-6"];
  
  const promises = carouselIds.map(async (id, index) => {
    const image = document.getElementById(id);
    const nameElement = document.getElementById(nameIds[index]); // Get the corresponding name element

    try {
      const game = await getRandomGame();
      if (game) {
        // Update the image source
        image.src = game.cover;

        // Update the name element
        if (nameElement) {
          nameElement.textContent = game.name; // Set the game name
        }

        // Add click event listener to load the game details
        image.addEventListener("click", () => {
          gameSelect(game.id);
        });
      } else {
        image.src = "#"; // Fallback image
        if (nameElement) {
          nameElement.textContent = "Unknown Game"; // Fallback text
        }
      }
    } catch (error) {
      console.error(`Failed to load carousel item for ${id}:`, error);
      image.src = "#"; // Fallback image
      if (nameElement) {
        nameElement.textContent = "Error"; // Fallback text in case of an error
      }
    }
  });

  await Promise.all(promises);
}

function shuffleButton() {
  usedGames = []
  displayCarousel();
}

displayCarousel();