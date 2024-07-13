let temperatureChart;

function getWeather() {
    const cityInput = document.getElementById('cityInput').value;
    const apiKey = '7348232085870507f0f621445d1d1586';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const cityName = data.city.name;
            const temperatureDataByDay = aggregateTemperatureByDay(data.list);
            
            renderWeatherInfo(cityName, temperatureDataByDay);
            renderTemperatureChart(temperatureDataByDay);
        })
        .catch(error => {
            console.log('Error fetching weather data:', error);
            const weatherInfo = document.getElementById('weatherInfo');
            weatherInfo.innerHTML = '<p>Failed to fetch weather data. Please try again.</p>';
        });
}

function aggregateTemperatureByDay(temperatureList) {
    const aggregatedData = {};
    
    temperatureList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString(); // Get date string
        const temperature = item.main.temp - 273.15; // Convert temperature from Kelvin to Celsius
        
        if (!aggregatedData[date]) {
            aggregatedData[date] = [];
        }
        
        aggregatedData[date].push(temperature);
    });
    
    // Calculate average temperature for each day
    for (const date in aggregatedData) {
        const temperatures = aggregatedData[date];
        const sum = temperatures.reduce((acc, cur) => acc + cur, 0);
        const averageTemperature = sum / temperatures.length;
        aggregatedData[date] = averageTemperature;
    }
    
    return aggregatedData;
}

function renderWeatherInfo(cityName, temperatureDataByDay) {
    const weatherInfo = document.getElementById('weatherInfo');
    const latestTemperature = Object.values(temperatureDataByDay)[0].toFixed(2);
    weatherInfo.innerHTML = `
        <h2>Weather in ${cityName}</h2>
        <p><strong>Latest Temperature:</strong> ${latestTemperature}°C</p>
    `;
}

function renderTemperatureChart(temperatureDataByDay) {
    if (temperatureChart) {
        temperatureChart.destroy();
    }

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(temperatureDataByDay),
            datasets: [{
                label: 'Temperature (°C)',
                data: Object.values(temperatureDataByDay),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
