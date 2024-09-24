import { Flex, Text, useStatStyles } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Traveller from "./Traveller";


import { DateTime } from "luxon";
import { FaThermometerQuarter } from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";
import { getWeatherData, getPastWeatherForecast } from "./WeatherServ";
import { FaWind } from "react-icons/fa";
export default function TravWeather(props) {
  const [weatherdata,setweatherdata]=useState()
  
  const [todaycastdata, settodaycastdata] = useState([]);
  const[rise,setrise]=useState()
  
  const[sunset, setsunset] = useState();
 
  const [forecastdata, setforecastdata] = useState();
  const getwet=async()=>{
 if (props.location) {
   const weather = await getWeatherData(
     props.location.geometry.coordinates[0],

     props.location.geometry.coordinates[1]
   );
   const timezone = "Asia/Kolkata"; // IST timezone

   // Convert Unix timestamps to local time using Luxon
   const sunriseTime = DateTime.fromSeconds(weather.sys.sunrise, {
     zone: "utc",
   })
     .setZone(timezone)
     .toLocaleString(DateTime.TIME_SIMPLE);
     setrise(sunriseTime.toLocaleString());
       const sunsetTime = DateTime.fromSeconds(weather.sys.sunset, {
         zone: "utc",
       })
         .setZone(timezone)
         .toLocaleString(DateTime.TIME_SIMPLE);
       setsunset(sunsetTime.toLocaleString());

   setweatherdata(weather);
   console.log("Travweather", weather);
 }
  }
  const getfore=async()=>{
    if (props.location) {
      const weather = await getPastWeatherForecast(
        props.location.geometry.coordinates[0],

        props.location.geometry.coordinates[1]
      );
       const today = DateTime.now().toISODate();
        const specificTimes = [
          "00:00",
          "04:00",
          "08:00",
          "12:00",
          "16:00",
          "20:00",
        ];
        

       // Filter data to include only today's weather
       const todayWeatherData = weather.hourly.time
         .map((time, index) => ({
           time,
           temperature: weather.hourly.temperature_2m[index],
         }))
         .filter((entry) => {
           const entryDateTime = DateTime.fromISO(entry.time);
           return (
             entryDateTime.toISODate() === today &&
             specificTimes.includes(entryDateTime.toFormat("HH:mm"))
           );
         });
      setforecastdata(weather);
      settodaycastdata(todayWeatherData)
      console.log("forecast", weather);
      
      console.log("todayforecast", todayWeatherData);
    }
  }
   const weatherColorMap = {
    clear: "#76c7c0",
    clouds: "#b3b3b3",
    rain: "red",
    snow: "#ffffff",
  };
  useEffect(()=>{
   getwet()
   getfore()
  },[])
  return (
    <Flex
      h="45vh"
      w="15vw"
      alignItems="center"
      flexDir="column"
      justify="space-between"
    >
      <Flex h="25vh" w="15vw" flexDir="column" alignItems="center">
        <Text fontSize="1.3em" fontWeight="600">
          {props.location && props.location.place_name}
        </Text>
        {weatherdata && (
          <Text fontSize="1.1em" fontWeight="500">
            {weatherdata.main.temp} °C
          </Text>
        )}
        <Text fontSize="1.1em" fontWeight="500">
          {weatherdata &&
            weatherdata.weather[0].main +
              ":  " +
              weatherdata.weather[0].description}
        </Text>
      </Flex>
      <Flex
        h="15vh"
        w="16vw"
        flexDir="column"
        borderWidth="1px"
        marginLeft="2vh"
        alignItems="center"
        justify="center"
      >
        {weatherdata && (
          <Flex flexDir="row" align="center" h="3vh" w="12vw">
            <Flex mr="1vh">
              <FaThermometerQuarter />
            </Flex>
            <Text fontSize="0.8em" fontWeight="500">
              Feels Like
            </Text>
            <Text fontSize="0.8em" fontWeight="600">
              : {weatherdata.main.feels_like}°C
            </Text>
          </Flex>
        )}
        {weatherdata && (
          <Flex flexDir="row" align="center" h="3vh" w="12vw">
            <Flex mr="1vh">
              <WiHumidity />
            </Flex>

            <Text fontSize="0.8em" fontWeight="500">
              Humidity
            </Text>
            <Text fontSize="0.8em" fontWeight="600">
              : {weatherdata.main.humidity}%
            </Text>
          </Flex>
        )}
        {weatherdata && (
          <Flex flexDir="row" align="center" h="3vh" w="12vw">
            <Flex mr="1vh">
              <FaWind />
            </Flex>

            <Text fontSize="0.8em" fontWeight="500">
              Wind Speed
            </Text>
            <Text fontSize="0.8em" fontWeight="600">
              : {weatherdata.wind.speed} Km/hr
            </Text>
          </Flex>
        )}
      </Flex>
      <Flex
        h="15vh"
        w="15vw"
        wrap="wrap"
        alignItems="center"
        justify="space-evenly"
      >
        {todaycastdata &&
          todaycastdata.map((entry, index) => (
            <Flex key={index} h="5vh" w="5vw" flexDir="column">
              <Text fontSize="0.9em" fontWeight="400">
                {DateTime.fromISO(entry.time).toLocaleString(
                  DateTime.TIME_SIMPLE
                )}
              </Text>
              <Text fontSize="0.9em" fontWeight="500">
                {entry.temperature} °C
              </Text>
            </Flex>
          ))}
      </Flex>
      <Flex>
        <Flex
          h="5vh"
          flexDir="column"
          alignItems="center"
          justify="space-evenly"
          w="5vw"
        >
          <Text fontSize="0.9em" fontWeight="400">
            Sunrise:
          </Text>
          <Text fontSize="0.9em" fontWeight="500">
            {rise && rise}
          </Text>
        </Flex>
        <Flex
          h="5vh"
          flexDir="column"
          alignItems="center"
          justify="space-evenly"
          w="5vw"
        >
          <Text fontSize="0.9em" fontWeight="400">
            Sunset:
          </Text>
          <Text fontSize="0.9em" fontWeight="500">
            {sunset && sunset}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
