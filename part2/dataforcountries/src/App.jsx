import { useEffect, useState } from "react";
import { getCountries } from "./services/countries";
import { getWeather } from "./services/openweather";

const Weather = ({ name, latitude, longitude }) => {
  const [temp, setTemp] = useState(0);
  const [urlIcon, setUrlIcon] = useState("");
  const [weather, setWeather] = useState("");
  const [speedWind, setSpeedWind] = useState(0);

  useEffect(() => {
    getWeather(latitude, longitude).then((response) => {
      setTemp(response.main.temp - 273.15);
      setUrlIcon(
        `https://openweathermap.org/img/wn/${response.weather[0].icon}@4x.png`,
      );
      setWeather(response.weather[0].description);
      setSpeedWind(response.wind.speed);
    });
  }, [latitude, longitude]);

  return (
    <div>
      <h3>Weather in {name}</h3>
      <p>Temperature: {temp.toFixed(2)} Celsius</p>
      <p>
        {weather}, wind: {speedWind}
      </p>
      <img src={urlIcon} width={200} height={200} />
    </div>
  );
};

const CountryInfo = ({ dataInfo }) => {
  return (
    <div>
      <h1>{dataInfo.name.common}</h1>
      <p>Capital: {dataInfo.capital}</p>
      <p>Area: {dataInfo.area}</p>
      <h3>Languages:</h3>
      {Object.values(dataInfo.languages).map((lang) => (
        <li key={lang}>{lang}</li>
      ))}
      <img src={dataInfo.flags.png} width={400} height={200} />
      <Weather
        name={dataInfo.name.common}
        latitude={dataInfo.latlng[0]}
        longitude={dataInfo.latlng[1]}
      />
    </div>
  );
};

const Country = ({ country }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <p>
        {country.name.common}{" "}
        <button onClick={() => setShow(!show)}>show</button>
      </p>
      {show && <CountryInfo dataInfo={country} />}
    </div>
  );
};

const CountriesList = ({ countriesArray }) => {
  if (countriesArray.length > 10)
    return <p>Too many matches, specify another filter</p>;
  if (countriesArray.length === 1)
    return <CountryInfo dataInfo={countriesArray[0]} />;
  return (
    <div>
      {countriesArray.map((country) => (
        <Country key={country.cca3} country={country} />
      ))}
    </div>
  );
};

const App = () => {
  const [countriesData, setCountriesData] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");

  const countriesFiltered = countriesData.filter((c) =>
    c.name.common.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  useEffect(() => {
    getCountries().then(setCountriesData);
  }, []);

  return (
    <div>
      <div>
        find countries{" "}
        <input onChange={(e) => setFilterQuery(e.target.value)} />
      </div>
      <CountriesList countriesArray={countriesFiltered} />
    </div>
  );
};

export default App;
