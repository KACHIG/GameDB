apiKey = "rJ0HxvXQ6t4H1e2MXzzpXlhFmRfAyO83QAearWi1"

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
    console.log(data.count)
    return data.count;
  }

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
}
  
async function getRandomGame() {
    let gameCount = await getCount();
    let findGame = Math.floor(Math.random() * gameCount) + 1;
    console.log(findGame);
    
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
  }

let test = getRandomGame();
console.log(test)

function displayCarousel() {

}
