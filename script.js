const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");

const toggleTheme = document.getElementById("toggleTheme");
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

async function getWeather(city) {
  try {
    // Step 1: Get coordinates from geocode.maps.co
    const geoRes = await fetch(`https://geocode.maps.co/search?q=${encodeURIComponent(city)}&api_key=685938351cb1b181638680yoxfe2d20`);
    const geoData = await geoRes.json();

    if (!geoData.length) {
      alert("City not found!");
      return;
    }

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    console.log("Coordinates:", lat, lon);

    // Step 2: Get weather from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
    );
    const weatherData = await weatherRes.json();
    console.log("WeatherData:", weatherData);

    renderCurrentWeather(city, weatherData.current_weather);
    renderForecast(weatherData.daily);
    renderCharts(weatherData.daily);

  } catch (err) {
    console.error("Error fetching weather:", err);
    alert("Something went wrong while fetching data.");
  }
}

function renderCurrentWeather(city, data) {
  if (!data) return;

  const date = new Date(data.time).toLocaleString();
  currentWeather.innerHTML = `
    <h2>${city}</h2>
    <p>${date}</p>
    <p><strong>Temp:</strong> ${data.temperature}°C</p>
    <p><strong>Wind:</strong> ${data.windspeed} km/h</p>
    <p><strong>Weather Code:</strong> ${data.weathercode}</p>
  `;
}

function renderForecast(daily) {
  forecast.innerHTML = "";
  if (!daily || !daily.time) return;

  for (let i = 0; i < daily.time.length; i++) {
    forecast.innerHTML += `
      <div class="card">
        <h4>${new Date(daily.time[i]).toDateString()}</h4>
        <p>🌡️ Max: ${daily.temperature_2m_max[i]}°C</p>
        <p>🌡️ Min: ${daily.temperature_2m_min[i]}°C</p>
        <p>🌧️ Precip: ${daily.precipitation_sum[i]} mm</p>
      </div>
    `;
  }
}

function renderCharts(daily) {
  if (!daily || !daily.time) return;

  const labels = daily.time;
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const precipitation = daily.precipitation_sum;

  const tempCtx = document.getElementById("tempChart").getContext("2d");
  const precipCtx = document.getElementById("humidityChart").getContext("2d");

if (window.tempChart && typeof window.tempChart.destroy === "function") window.tempChart.destroy();
if (window.precipChart && typeof window.precipChart.destroy === "function") window.precipChart.destroy();


  window.tempChart = new Chart(tempCtx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Max Temp (°C)",
          data: maxTemps,
          borderColor: "#ff7675",
          backgroundColor: "#ff767533",
          fill: true
        },
        {
          label: "Min Temp (°C)",
          data: minTemps,
          borderColor: "#74b9ff",
          backgroundColor: "#74b9ff33",
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });

  window.precipChart = new Chart(precipCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Precipitation (mm)",
        data: precipitation,
        backgroundColor: "#00cec9aa"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" } },
        y: { ticks: { color: "#fff" } }
      }
    }
  });
}
window.addEventListener("load", () => {
  getWeather("Lahore");
});
// Initial load with default city