import {
  Button,
  Flex,
  FormLabel,
  Input,
  Text,
  UnorderedList,
  useStatStyles,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import "../Styles.css";
import mapboxgl from "mapbox-gl";
import axios from "axios";

import { css } from "@emotion/react";
import "mapbox-gl/dist/mapbox-gl.css";
import { getWeatherData } from "./WeatherServ";
import TravWeather from "./TravWeather";
export default function Traveller() {
  const [start, setstart] = useState("");
  const [end, setend] = useState("");
  const mapContainerRef = useRef();

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [endsuggestions, setendSuggestions] = useState([]);
  const [showendSuggestions, setShowendSuggestions] = useState(false);
  const [route, setRoute] = useState(null);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            autocomplete: true,
            limit: 5,
          },
        }
      );
      setSuggestions(response.data.features);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };
  const fetchendSuggestions = async (query) => {
    if (!query) {
      setendSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            autocomplete: true,
            limit: 5,
          },
        }
      );
      setendSuggestions(response.data.features);
      setShowendSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setendSuggestions([]);
    }
  };
  const mapRef = useRef();
  // const weatherColorMap = {
  //   clear: "#76c7c0",
  //   clouds: "#b3b3b3",
  //   rain: "red",
  //   snow: "#ffffff",
  //   // Add more mappings as needed
  // };

  // // Function to determine color based on weather condition
  // const getWeatherColor = (condition) => {
  //   if (condition.includes("clear")) return weatherColorMap.clear;
  //   if (condition.includes("clouds")) return weatherColorMap.clouds;
  //   if (condition.includes("rain")) return weatherColorMap.rain;
  //   if (condition.includes("snow")) return weatherColorMap.snow;
  //   return "#888888"; // Default color for other conditions
  // };

  const MAPBOX_ACCESS_TOKEN = `${process.env.REACT_APP_Auth_token}`;
  const geocodeLocation = async (location) => {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location
      )}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
        },
      }
    );
    const [lng, lat] =
      response.data.features[0].geometry &&
      response.data.features[0].geometry.coordinates;
    // console.log(response);
    return { lng, lat };
  };

  useEffect(() => {
    mapboxgl.accessToken = `${process.env.REACT_APP_Auth_token}`;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,

      style: "mapbox://styles/mapbox/streets-v11",
      center: [78.4695, 17.3558], // Default center
      zoom: 9,
    });

    map.on("load", async () => {
      if (route) {
        // Add the route source
        map.addSource("route", {
          type: "geojson",
          data: route,
        });

        // Add a layer to visualize the route
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
          },
        });

        const routePoints = getRoutePoints(route);
        // const weatherPromises = routePoints.map(([lng, lat]) =>
        //   getWeatherData(lng, lat)
        // );
        // const weatherData = await Promise.all(weatherPromises);
        // const coloredRoute = {
        //   type: "Feature",
        //   geometry: {
        //     type: "LineString",
        //     coordinates: routePoints,
        //   },
        //   properties: {
        //     lineColors: weatherData.map((data) =>
        //       getWeatherColor(data.weather[0].description)
        //     ),
        //   },
        // };
        // map.addSource("route", {
        //   type: "geojson",
        //   data: coloredRoute,
        //   lineMetrics: true,
        // });

        // Add a layer with a gradient line based on the weather conditions
        // map.addLayer({
        //   id: "route",
        //   type: "line",
        //   source: "route",
        //   layout: {
        //     "line-join": "round",
        //     "line-cap": "round",
        //   },
        //   paint: {
        //     "line-width": 5,
        //     "line-gradient": [
        //       "interpolate",
        //       ["linear"],
        //       ["line-progress"],
        //       0,
        //       weatherData[0]
        //         ? getWeatherColor(weatherData[0].weather[0].description)
        //         : "#888888",
        //       1,
        //       weatherData[weatherData.length - 1]
        //         ? getWeatherColor(
        //             weatherData[weatherData.length - 1].weather[0].description
        //           )
        //         : "#888888",
        //     ],
        //   },
        // });
        routePoints.forEach(async (coord) => {
          const [lng, lat] = coord;
          const weatherData = await getWeatherData(lng, lat);

          if (weatherData) {
            // Create a marker for each weather data point
            // console.log(weatherData);
            const marker = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map);

            // Add a popup with weather info
            const popup = new mapboxgl.Popup({
              offset: 25,
              className: "weather-popup",
            }).setHTML(`
          <div class="popup-content">
                            <h3 class="popup-title">Weather Info</h3>
                            <p  class="popup-location">Location: ${weatherData.name}</p>
                            <p class="popup-temp">Temperature: ${weatherData.main.temp} °C</p>
                            <p  class="popup-description">Weather: ${weatherData.weather[0].description}</p>
                            </div>
                    `);
            marker.setPopup(popup);
          }
        });

        // Adjust the map to fit the route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.fitBounds(bounds, {
          padding: 20,
        });
        //       map.on("mouseenter", "route", (e) => {
        //         map.getCanvas().style.cursor = "pointer";
        //       });

        // map.on("mousemove", "route", (e) => {
        //   const coords = e.lngLat;
        //   const weatherIndex = Math.floor(
        //     (e.point.x / map.getCanvas().width) * routePoints.length
        //   );
        //   const weatherInfo = weatherData[weatherIndex];

        //   if (weatherInfo) {
        //     // Close existing popup
        //     if (popup) popup.remove();

        //     // Create new popup
        //     popup = new mapboxgl.Popup({ offset: 25 })
        //       .setLngLat(coords)
        //       .setHTML(
        //         `
        //                         <h3>Weather Info</h3>
        //                         <p>Temperature: ${weatherInfo.main.temp} °C</p>
        //                         <p>Weather: ${weatherInfo.weather[0].description}</p>
        //                     `
        //       )
        //       .addTo(map);
        //   }
        // });

        // // Remove popup on mouse leave
        // map.on("mouseleave", "route", () => {
        //   map.getCanvas().style.cursor = "";
        //   if (popup) popup.remove();
        // });
      }
    });

    return () => map.remove();
  }, [route]);
  const getRoute = async (start, end) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            geometries: "geojson", // Get the route as GeoJSON
          },
        }
      );

      // Extract the route's geometry from the response
      const geometry = response.data.routes[0].geometry;
      const routeGeoJSON = {
        type: "Feature",
        geometry: geometry,
        properties: {},
      };
      // console.log("Rer", routeGeoJSON);
      return routeGeoJSON;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  const handleCalculateRoute = async (currentLocation, destination) => {
    // Geocode locations to get coordinates

    const startCoords = await geocodeLocation(currentLocation);
    const endCoords = await geocodeLocation(destination);

    // Get route
    const routes = await getRoute(
      `${startCoords.lng},${startCoords.lat}`,
      `${endCoords.lng},${endCoords.lat}`
    );
    setRoute(routes);
    // console.log(routes);

    // Fetch weather data for waypoints (e.g., start, mid, end)
    // const midCoords =
    //   route.coordinates[Math.floor(route.coordinates.length / 2)];
    // const weatherStart = await getWeather(startCoords.lat, startCoords.lng);
    // const weatherMid = await getWeather(midCoords[1], midCoords[0]);
    // const weatherEnd = await getWeather(endCoords.lat, endCoords.lng);
    // setWeatherData([weatherStart, weatherMid, weatherEnd]);
  };
  const getRoutePoints = (routeGeoJSON, numPoints = 5) => {
    const coordinates = routeGeoJSON.geometry.coordinates;
    const totalPoints = coordinates.length;
    const interval = Math.floor(totalPoints / (numPoints - 1));
    const routePoints = [];

    for (let i = 0; i < totalPoints; i += interval) {
      routePoints.push(coordinates[i]);
    }

    // Ensure the last point is the end of the route
    if (routePoints[routePoints.length - 1] !== coordinates[totalPoints - 1]) {
      routePoints.push(coordinates[totalPoints - 1]);
    }

    return routePoints;
  };
  const handleSuggestionClick = (suggestion) => {
    setSug1(suggestion);
    setstart(suggestion.place_name);
    setShowSuggestions(false);
    setSuggestions([]); // Pass the selected suggestion to parent component
  };
  const handleendSuggestionClick = (suggestion) => {
    setSug2(suggestion);
    setend(suggestion.place_name);
    setShowendSuggestions(false);
    setendSuggestions([]); // Pass the selected suggestion to parent component
  };
  const [wea, setwea] = useState(false);

  const [sug1, setSug1] = useState("");

  const [sug2, setSug2] = useState("");
  const responsiveStyle = css`
    @media (max-width: 600px) {
      background-color: lightblue;
      height: 350vh;
      width: 100vw;
    }
  `;
  const responsiveStyle2 = css`
    @media (max-width: 600px) {
      height: 300vh;
      width: 100vw;
      flex-direction: column;
    }
  `;
  const responsiveStyle3 = css`
    @media (max-width: 600px) {
      height: 50vh;
      width: 100vw;
      flex-direction: column;
    }
  `;
  return (
    <Flex
      h="100vh"
      w="100vw"
      justify="center"
      alignItems="center"
      flexDir="column"
      bg="white"
      className="cont"
      css={responsiveStyle}
    >
      <Flex
        justify="center"
        h="90vh"
        w="90vw"
        alignItems="center"
        borderWidth="1px"
        className="box"
        borderRadius="2vh"
        backgroundImage="linear-gradient(120deg, #f6d365 0%,#fda085 100%)"
        css={responsiveStyle2}

        // backgroundImage= 'linear-gradient(to right, #ffecd2 0%,#fcb69f 100%)'
      >
        {wea && <TravWeather location={sug1 && sug1} />}

        <Flex flexDir="column" justify="center" alignItems="center">
          <Flex
            h="15vh"
            w="50vw"
            justify="space-evenly"
            alignItems="center"
            css={responsiveStyle3}
          >
            <Flex
              w={{ md: "20vw", base: "100%" }}
              alignItems="center"
              justify="space-evenly"
            >
              <FormLabel>Start</FormLabel>
              <Flex flexDir="column" w={{ md: "16vw", base: "80%" }}>
                <Input
                  value={start}
                  type="text"
                  placeholder="Enter Start Location"
                  onChange={(e) => {
                    setstart(e.target.value);

                    setwea(false);
                    fetchSuggestions(e.target.value);
                  }}
                  borderColor="#1c1f1d"
                  fontWeight="500"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setShowSuggestions(false)}
                  className="location-input"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <UnorderedList
                    h="10vh"
                    overflowY="scroll"
                    className="suggestions-list"
                  >
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown to handle clicks before input blur
                        className="suggestion-item"
                      >
                        {suggestion.place_name}
                      </li>
                    ))}
                  </UnorderedList>
                )}
              </Flex>
            </Flex>
            <Flex
              w={{ md: "20vw", base: "100%" }}
              alignItems="center"
              justify="space-evenly"
            >
              <FormLabel>Destination</FormLabel>
              <Flex flexDir="column" w={{ md: "16vw", base: "70%" }}>
                <Input
                  value={end}
                  type="text"
                  borderColor="#1c1f1d"
                  fontWeight="500"
                  placeholder="Enter End Location"
                  onChange={(e) => {
                    setend(e.target.value);
                    setwea(false);
                    fetchendSuggestions(e.target.value);
                  }}
                  onFocus={() => setShowendSuggestions(true)}
                  onBlur={() => setShowendSuggestions(false)}
                  className="location-input"
                />
                {endsuggestions && endsuggestions.length > 0 && (
                  <UnorderedList
                    h="10vh"
                    overflowY="scroll"
                    className="endsuggestions-list"
                  >
                    {endsuggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        onMouseDown={() => handleendSuggestionClick(suggestion)} // Use onMouseDown to handle clicks before input blur
                        className="endsuggestion-item"
                      >
                        {suggestion.place_name}
                      </li>
                    ))}
                  </UnorderedList>
                )}
              </Flex>
            </Flex>

            {sug1 && sug2 && (
              <Button
                onClick={() => {
                  handleCalculateRoute(start, end);
                  setwea(true);
                }}
                bg="#1c1f1d"
                color="white"
              >
                Search
              </Button>
            )}
          </Flex>
          <Flex h="50vh" w="50vw" bg="#1c1f1d" borderRadius="2vh" m="5vh">
            <div
              style={{ height: "95%", width: "95%", margin: "auto" }}
              ref={mapContainerRef}
              className="map-container"
            />
          </Flex>
        </Flex>
        {wea && <TravWeather location={sug2 && sug2} />}
      </Flex>
    </Flex>
  );
}
