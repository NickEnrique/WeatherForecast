import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Container,
  Paper,
  MenuItem,
  Grid2 as Grid,
  TextField,
  Button,
} from "@mui/material";

//for formatting date input field
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import * as d3 from "d3";

const D3ScatterPlot = ({ data, mainDate }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.score)])
      .nice()
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale));

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.score))
      .attr("r", (d) =>
        d.date.toISOString().split("T")[0] === mainDate ? 6 : 4
      )
      .attr("fill", (d) =>
        d.date.toISOString().split("T")[0] === mainDate ? "red" : "blue"
      )
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("r", 8);
        svg
          .append("text")
          .attr("x", xScale(d.date))
          .attr("y", yScale(d.score) - 10)
          .attr("class", "hover-text")
          .text(
            `Date: ${d.date.toISOString().split("T")[0]}, Score: ${d.score}`
          );
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).attr("r", (d) =>
          d.date.toISOString().split("T")[0] === mainDate ? 6 : 4
        );
        svg.selectAll(".hover-text").remove();
      });
  }, [data, mainDate]);

  return <svg ref={svgRef}></svg>;
};

export default function Anomaly() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState(null);
  const [rainfall, setRainfall] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [mintemp, setMinTemp] = useState("");
  const [maxtemp, setMaxTemp] = useState("");
  const [windspeed, setWindspeed] = useState("");
  const [uv, setUv] = useState("");

  const [chartData, setChartData] = useState(null);
  const [mainDate, setMainDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const handleDateChange = (value) => {
    const minDate = new Date('2009-01-01');
    const maxDate = new Date('2024-06-29');

    if (value < minDate || value > maxDate) {
        setError("Date must be between 2009-01-01 and 2024-06-29");
    } else {
        setError("");
    }

    setDate(value);
  }

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setValidationErrors({});
    const errors = {};
    const features = {
      rainfall,
      humidity,
      pressure,
      mintemp,
      maxtemp,
      windspeed,
      uv,
    };
    Object.keys(features).forEach((f) => {
      if (features[f] < 0) {
        errors[f] = "Value cannot be negative";
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    const requestBody = {
      city_code: city,
      date: date.toISOString().split("T")[0],
      rainfall: parseFloat(rainfall),
      humidity: parseFloat(humidity),
      pressure: parseFloat(pressure),
      mintemp: parseFloat(mintemp),
      maxtemp: parseFloat(maxtemp),
      wind_gust_speed: parseFloat(windspeed),
      uv_index: parseFloat(uv),
    };

    try {
      const response = await fetch("http://localhost:8000/predict_anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();

      if (result.status === "success") {
        const formattedData = Object.entries(result.data).map(
          ([date, info]) => ({
            date: new Date(date),
            anomaly: info.anomaly,
            score: info.score,
          })
        );

        setChartData(formattedData); // Set data for D3 chart
        setMainDate(requestBody.date); // Store main date for highlighting
      } else {
        setError("Failed to retrieve prediction data.");
      }
    } catch (err) {
      setError("Error predicting anomaly. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ m: 4 }}>
      <Container>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "600",
            m: 1,
            fontSize: { xs: "1rem", sm: "1.1rem" },
          }}
        >
          Anomaly Detection Using Isolation Forest
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: "justify",
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
          }}
        >
          Isolation Forest is an unsupervised machine-learning algorithm used
          for anomaly detection. This model is used to analyse and detect
          anomalous data for each weather variable. By visualising the
          anomalies, we can uncover relationships between weather variables,
          which is useful for predicting severe weather events.
        </Typography>
        <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
              mb: 2,
            }}
          >
            Try the Model
          </Typography>
          <Container sx={{ m: 1 }}>
            <form onSubmit={submitForm}>
              {/* City Input */}
              <Container
                sx={{ display: "flex", justifyContent: "center", mb: 2 }}
              >
                <TextField
                  select
                  required
                  label="Select City"
                  value={city}
                  sx={{ minWidth: "200px" }}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <MenuItem value="MEL">Melbourne</MenuItem>
                  <MenuItem value="SYD">Sydney</MenuItem>
                  <MenuItem value="PER">Perth</MenuItem>
                  <MenuItem value="BNE">Brisbane</MenuItem>
                  <MenuItem value="DAR">Darwin</MenuItem>
                  <MenuItem value="HOB">Hobart</MenuItem>
                </TextField>
              </Container>

              <Grid
                container
                spacing={2}
                sx={{ display: "flex", justifyContent: "center", mb: 3 }}
              >
                {/* Date, Rainfall, Humidity Input */}
                <Grid item xs={12} sm={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date (MM/DD/YY)"
                      value={date}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} />}
                      minDate={new Date('2009-01-01')}
                      maxDate={new Date('2024-06-29')}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Rainfall (mm)"
                    value={rainfall}
                    onChange={(e) => setRainfall(e.target.value)}
                    error={!!validationErrors.rainfall}
                    helperText={validationErrors.rainfall}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Humidity (%)"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    error={!!validationErrors.humidity}
                    helperText={validationErrors.humidity}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>

                {/* Pressure, Evaporation, Sunshine Input */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Pressure (hPa)"
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                    error={!!validationErrors.pressure}
                    helperText={validationErrors.pressure}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Min Temp"
                    value={mintemp}
                    onChange={(e) => setMinTemp(e.target.value)}
                    error={!!validationErrors.mintemp}
                    helperText={validationErrors.mintemp}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Max Temp"
                    value={maxtemp}
                    onChange={(e) => setMaxTemp(e.target.value)}
                    error={!!validationErrors.maxtemp}
                    helperText={validationErrors.maxtemp}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Windspeed (km/h)"
                    value={windspeed}
                    onChange={(e) => setWindspeed(e.target.value)}
                    error={!!validationErrors.windspeed}
                    helperText={validationErrors.windspeed}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="UV Index"
                    value={uv}
                    onChange={(e) => setUv(e.target.value)}
                    error={!!validationErrors.uv}
                    helperText={validationErrors.uv}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Container sx={{ display: "flex", justifyContent: "center" }}>
                <Button type="submit" variant="contained" color="primary" disabled={!!error || !date}>
                  Submit
                </Button>
              </Container>

              {/* results and data visualisation goes here */}
              {loading && <Typography variant="body2">Loading...</Typography>}
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
            </form>
          </Container>
        </Paper>
        {chartData && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Anomaly Detection Scatter Plot</Typography>
            <D3ScatterPlot data={chartData} mainDate={mainDate} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
