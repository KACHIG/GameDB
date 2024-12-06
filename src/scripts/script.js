apiKey = "rJ0HxvXQ6t4H1e2MXzzpXlhFmRfAyO83QAearWi1";

let uniqueNumbers = [5];
let findGame = 0;

function showGameResults() {
  document.getElementById("mainPage").style.visibility = "hidden";
  document.getElementById("gameInfo").style.visibility = "hidden";
  document.getElementById("gameResults").style.visibility = "visible";
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

  const raw = "fields *; where id = " + gameId + ";";

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let response = await fetch("https://ho8o8ytc66.execute-api.us-west-2.amazonaws.com/production/v4/games", requestOptions)

  let data = await response.json();
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