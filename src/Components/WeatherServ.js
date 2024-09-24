import axios from "axios";

import { DateTime } from "luxon";
const WEATHER_API_KEY = "b22dffd8206ba46a6ff3246d10efc07c";
const we = "1984414d75e6320e772e5617ce18153e";
export const getWeatherData = async (lng, lat) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: lat,
          lon: lng,
          appid: WEATHER_API_KEY,
          units: "metric", // Use 'imperial' for Fahrenheit
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};
export const getPastWeatherForecast = async (longitude,latitude) => {
  // Calculate start and end dates
  const endDate = DateTime.now().toISODate(); // Today's date
  const startDate = DateTime.now().minus({ days: 5 }).toISODate(); // 5 days ago

  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=sunrise,sunset`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching historical weather data:", error);
    return null;
  }
};
