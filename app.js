const API_KEY = "427f323096cbf6058c47782c87e83069";
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

let timer = null;

async function searchMedia() {
    const query = document.getElementById("query").value.trim();
    const type = document.getElementById("type").value;
    const resultsDiv = document.getElementById("results");

    if (query === "") {
        resultsDiv.innerHTML = "<p>Please enter a search term.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p class='loading'>Searching...</p>";

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/${type}?api_key=${API_KEY}&query=${query}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            resultsDiv.innerHTML = "";
            data.results.forEach((item) => displayResult(item, type));
        } else {
            resultsDiv.innerHTML = "<p>No results found.</p>";
        }
    } catch (error) {
        resultsDiv.innerHTML = "<p>Error while searching. Please try again.</p>";
    }
}

function displayResult(item, type) {
    const resultsDiv = document.getElementById("results");
    const resultCard = document.createElement("div");
    resultCard.className = "result-card";

    const title = type === "tv" ? item.name : item.title;
    const overview = item.overview || "No overview available";
    const poster = item.poster_path ? BASE_IMAGE_URL + item.poster_path : "";

    resultCard.innerHTML = `
        <h2>${title}</h2>
        <p><strong>Overview:</strong> ${overview}</p>
        <img src="${poster}" alt="${title} Poster" />
        <p><strong>Release Date:</strong> ${type === "tv" ? item.first_air_date : item.release_date}</p>
    `;

    if (type === "tv") {
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Seasons";
        detailsButton.onclick = () => fetchSeasons(item.id);
        resultCard.appendChild(detailsButton);
    }

    resultsDiv.appendChild(resultCard);
}

async function fetchSeasons(showId) {
    const seasonContainer = document.createElement("div");
    seasonContainer.innerHTML = "<h3>Fetching seasons...</h3>";

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}`
        );
        const showData = await response.json();

        if (showData.seasons && showData.seasons.length > 0) {
            seasonContainer.innerHTML = "<h3>Seasons:</h3>";
            showData.seasons.forEach((season) => displaySeason(showId, season, seasonContainer));
        } else {
            seasonContainer.innerHTML = "<p>No seasons found.</p>";
        }
    } catch (error) {
        seasonContainer.innerHTML = "<p>Error fetching seasons. Please try again.</p>";
    }

    document.getElementById("results").appendChild(seasonContainer);
}

async function displaySeason(showId, season, container) {
    const seasonDiv = document.createElement("div");
    seasonDiv.innerHTML = `<h4>${season.name}</h4>`;
    if (season.poster_path) {
        seasonDiv.innerHTML += `<img src="${BASE_IMAGE_URL + season.poster_path}" alt="${season.name}" />`;
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/tv/${showId}/season/${season.season_number}?api_key=${API_KEY}`
        );
        const seasonData = await response.json();

        if (seasonData.episodes && seasonData.episodes.length > 0) {
            const episodeList = document.createElement("ul");
            seasonData.episodes.forEach((episode) => {
                const episodeItem = document.createElement("li");
                episodeItem.innerHTML = `
                    <strong>${episode.episode_number}. ${episode.name}</strong> - ${episode.air_date || "Unknown Date"}
                    <p>${episode.overview || "No overview available"}</p>
                    ${
                        episode.still_path
                            ? `<img src="${BASE_IMAGE_URL + episode.still_path}" alt="${episode.name}" style="width: 150px;" />`
                            : ""
                    }
                `;
                episodeList.appendChild(episodeItem);
            });
            seasonDiv.appendChild(episodeList);
        } else {
            seasonDiv.innerHTML += "<p>No episodes found.</p>";
        }
    } catch (error) {
        seasonDiv.innerHTML += "<p>Error fetching episodes. Please try again.</p>";
    }

    container.appendChild(seasonDiv);
}