const elements = {
    date: document.getElementById("current-date"),
    temperature: document.getElementById("temperature"),
    description: document.getElementById("weather-description"),
    icon: document.getElementById("weather-icon"),
    feelsLike: document.getElementById("feels-like"),
    humidity: document.getElementById("humidity"),
    windSpeed: document.getElementById("wind-speed"),
    windDir: document.getElementById("wind-direction"),
    windGust: document.getElementById("wind-gust"),
    pressure: document.getElementById("pressure"),
    dateSelect: document.getElementById("date-select"),
  };
  
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle: light",
    57: "Freezing drizzle: dense",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain: light",
    67: "Freezing rain: heavy",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  
  const weatherIcons = {
    0: "clear.png",
    1: "clear.png",
    2: "partly cloudy.png",
    3: "partly cloudy.png",
    45: "fog.png",
    48: "fog.png",
    51: "light drizzle.png",
    53: "light drizzle.png",
    55: "light drizzle.png",
    56: "rain.png",
    57: "rain.png",
    61: "rain.png",
    63: "rain.png",
    65: "heavy rain.png",
    66: "heavy rain.png",
    67: "heavy rain.png",
    71: "snow.png",
    73: "snow.png",
    75: "heavy snow.png",
    77: "heavy snow.png",
    80: "rain.png",
    81: "rain.png",
    82: "rain.png",
    85: "snow.png",
    86: "heavysnow.png",
    95: "thunderstorm.png",
    96: "thunderstorm.png",
    99: "thunderstorm.png"
  };
  
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
  
  function getIconPath(code) {
    const iconFile = weatherIcons[code] || "default.png";
    const fullPath = `icons/${iconFile}`;
    console.log(`Icon path: ${fullPath}`);
    return fullPath;
  }
  
  function updateUI(current) {
    const description = weatherCodes[current.weathercode] || `Code ${current.weathercode}`;
  
    elements.date.textContent = new Date().toDateString();
    elements.temperature.textContent = `${current.temperature_2m} °C`;
    elements.description.textContent = description;
    elements.feelsLike.textContent = `${current.apparent_temperature} °C`;
    elements.humidity.textContent = `${current.relative_humidity_2m} %`;
    elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    elements.windDir.textContent = `${current.wind_direction_10m}°`;
    elements.windGust.textContent = `${current.wind_gusts_10m} km/h`;
    elements.pressure.textContent = `${current.surface_pressure} hPa`;
    elements.icon.src = getIconPath(current.weathercode);
  }
  
  function updateUIDaily(daily, index) {
    const description = weatherCodes[daily.weathercode[index]] || `Code ${daily.weathercode[index]}`;
  
    elements.date.textContent = formatDate(daily.time[index]);
    elements.temperature.textContent = `${daily.temperature_2m_max[index]} °C`;
    elements.description.textContent = description;
    elements.feelsLike.textContent = `${daily.apparent_temperature_max[index]} °C`;
    elements.humidity.textContent = `${daily.relative_humidity_2m_max[index]} %`;
    elements.windSpeed.textContent = `${daily.wind_speed_10m_max[index]} km/h`;
    elements.windDir.textContent = `${daily.wind_direction_10m_dominant[index]}°`;
    elements.windGust.textContent = `${daily.wind_gusts_10m_max[index]} km/h`;
    elements.pressure.textContent = `${daily.surface_pressure_max[index]} hPa`;
    elements.icon.src = getIconPath(daily.weathercode[index]);
  }
  
  function populateDates(dates) {
    elements.dateSelect.innerHTML = `<option disabled selected>Select a date</option>`;
    dates.forEach((date, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = formatDate(date);
      elements.dateSelect.appendChild(option);
    });
  }
  
  let chart;
  function renderChart(dates, temps) {
    const ctx = document.getElementById("temp-chart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates.map(d => formatDate(d)),
        datasets: [{
          label: "Max Temp (°C)",
          data: temps,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
      }
    });
  }
  
  let weatherData = null;
  
  async function getWeather() {
    const apiURL = "https://api.open-meteo.com/v1/forecast?latitude=40.5872&longitude=22.9482&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weathercode,apparent_temperature,surface_pressure&daily=temperature_2m_max,weathercode,apparent_temperature_max,relative_humidity_2m_max,surface_pressure_max,wind_speed_10m_max,wind_direction_10m_dominant,wind_gusts_10m_max&timezone=auto";
  
    const res = await fetch(apiURL);
    weatherData = await res.json();
  
    
    populateDates(weatherData.daily.time);
    renderChart(weatherData.daily.time, weatherData.daily.temperature_2m_max);
  }
  
  document.getElementById("now-btn").addEventListener("click", () => {
    if (weatherData) updateUI(weatherData.current);
  });
  
  document.getElementById("today-btn").addEventListener("click", () => {
    if (weatherData) updateUIDaily(weatherData.daily, 0);
  });
  
  elements.dateSelect.addEventListener("change", (e) => {
    const index = parseInt(e.target.value);
    if (!isNaN(index) && weatherData) {
      updateUIDaily(weatherData.daily, index);
    }
  });
  
  getWeather();
  