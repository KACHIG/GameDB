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

  let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/companies", requestOptions)

  let data = await response.json();
  return data[0]
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

async function updateCompanyInfo(game) {
  const developer = document.getElementById("developer");
  const publisher = document.getElementById("publisher");

  // Fallback values for unknown companies
  if (!game.involved_companies || game.involved_companies.length === 0) {
    console.log("No involved companies, setting defaults.");
    if (developer) developer.textContent = "Unknown Developer";
    if (publisher) publisher.textContent = "Unknown Publisher";
    return;
  }

  // Create flags to check if developer or publisher has been set
  let developerSet = false;
  let publisherSet = false;

  // Iterate through involved companies with async/await
  for (const involvedCompany of game.involved_companies) {
    try {
      // Get the company ID
      const companyId = involvedCompany.company;
      console.log(`Fetching company data for company ID: ${companyId}`);
      
      // Fetch the company data using your getCompany function
      const companyData = await getCompany(companyId);

      // Log the full company data to inspect the structure
      console.log(`Fetched company data for ${companyId}:`, companyData);

      // Check if 'developed' and 'published' fields exist in company data
      const isDeveloper = companyData.developed && companyData.developed.includes(game.id);
      const isPublisher = companyData.published && companyData.published.includes(game.id);

      console.log(`Is Developer: ${isDeveloper}, Is Publisher: ${isPublisher}`);

      // Update the developer if the company is a developer
      if (isDeveloper && !developerSet) {
        if (developer) {
          console.log(`Setting developer: ${companyData.name}`);
          developer.textContent = companyData.name;
        }
        developerSet = true;  // Prevent further updates to the developer field
      }

      // Update the publisher if the company is a publisher
      if (isPublisher && !publisherSet) {
        if (publisher) {
          console.log(`Setting publisher: ${companyData.name}`);
          publisher.textContent = companyData.name;
        }
        publisherSet = true;  // Prevent further updates to the publisher field
      }

    } catch (error) {
      console.error(`Error fetching company data for ID ${involvedCompany.company}:`, error);
      // If an error occurs, just skip this company and continue
    }
  }

  // If neither developer nor publisher were set, show the fallback text
  if (!developerSet && developer) {
    console.log("Setting fallback developer.");
    developer.textContent = "Unknown Developer";
  }
  if (!publisherSet && publisher) {
    console.log("Setting fallback publisher.");
    publisher.textContent = "Unknown Publisher";
  }
}


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
        ratings.textContent = game.rating ? `Rating: ${game.rating.toFixed(1)}` : "No rating available";
      }

      // Add screenshots
      const screenshotsContainer = document.getElementById("screenshots");
      if (screenshotsContainer) {
        screenshotsContainer.innerHTML = ""; // Clear any existing screenshots

        if (game.screenshots && game.screenshots.length > 0) {
          game.screenshots.forEach((screenshot) => {
            const img = document.createElement("img");
            img.src = `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`;
            img.alt = "Game Screenshot";
            img.className = "screenshot"; // Add the 'screenshot' class
            img.style.cursor = "pointer"; // Change cursor to pointer for click indication

            // Add click event to expand the image
            img.addEventListener("click", () => {
              const lightbox = document.createElement("div");
              lightbox.className = "lightbox";

              const expandedImg = document.createElement("img");
              expandedImg.src = img.src; // Use the same image source
              expandedImg.alt = img.alt;

              // Close lightbox on click
              lightbox.addEventListener("click", () => {
                document.body.removeChild(lightbox);
              });

              lightbox.appendChild(expandedImg);
              document.body.appendChild(lightbox);
            });

            screenshotsContainer.appendChild(img);
          });
        } else {
          const noScreenshotsMessage = document.createElement("p");
          noScreenshotsMessage.textContent = "No screenshots available.";
          screenshotsContainer.appendChild(noScreenshotsMessage);
        }
      }

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