import React, { useState, useRef, useEffect } from "react";
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

function ResultsChart({ chartData, mainDate }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous elements

    const width = 600,
      height = 400;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Set up scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(chartData, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(chartData, (d) => d.minTemp),
        d3.max(chartData, (d) => d.maxTemp),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Line generators
    const minTempLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.minTemp));

    const maxTempLine = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.maxTemp));

    // Draw minTemp line
    svg
      .append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", minTempLine);

    // Draw maxTemp line
    svg
      .append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1.5)
      .attr("d", maxTempLine);

    // Add tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Circles for each data point with hover interactivity
    svg
      .selectAll(".data-point")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.maxTemp))
      .attr("r", 5)
      .attr("fill", "orange")
      .on("mouseover", function (event, d) {
        const [offsetX, offsetY] = d3.pointer(event); // Get relative coordinates within the SVG

        tooltip
          .style("opacity", 1)
          .html(
            `<strong>Date:</strong> ${d.date.toDateString()}<br>
                   <strong>Min Temp:</strong> ${d.minTemp}°C<br>
                   <strong>Max Temp:</strong> ${d.maxTemp}°C`
          )
          .style("left", `${offsetX + 10}px`) // Position near the point
          .style("top", `${offsetY - 30}px`); // Slightly above the point

        d3.select(this).attr("r", 7).attr("fill", "darkorange"); // Highlight on hover
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
        d3.select(this).attr("r", 5).attr("fill", "orange"); // Reset circle
      });

    // Highlight the main date point
    const mainDateData = chartData.find(
      (d) => d.date.toISOString().split("T")[0] === mainDate
    );
    if (mainDateData) {
      svg
        .append("circle")
        .attr("cx", xScale(mainDateData.date))
        .attr("cy", yScale(mainDateData.maxTemp))
        .attr("r", 6)
        .attr("fill", "red");
      svg
        .append("circle")
        .attr("cx", xScale(mainDateData.date))
        .attr("cy", yScale(mainDateData.minTemp))
        .attr("r", 6)
        .attr("fill", "red");
    }

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
  }, [chartData, mainDate]);

  return (
    <div style={{ position: "relative", background: "blue" }}>
      <svg ref={svgRef} width={600} height={400}></svg>
      <div
        ref={tooltipRef}
        style={{ position: "absolute", opacity: 0, zIndex: "999", top: "0" }}
      ></div>
    </div>
  );
}


export default function Prediction() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState(null);
  const [rainfall, setRainfall] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [evaporation, setEvaporation] = useState("");
  const [sunshine, setSunshine] = useState("");
  const [windspeed, setWindspeed] = useState("");
  const [uv, setUv] = useState("");

  const [predictedMinTemp, setMinTemp] = useState(null);
  const [predictedMaxTemp, setMaxTemp] = useState(null);

  const [chartData, setChartData] = useState(null);
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
    setMinTemp(null);
    setMaxTemp(null);
    setLoading(true);
    setValidationErrors({});

    // Validation for negative values
    const errors = {};
    const features = {
      rainfall,
      humidity,
      pressure,
      evaporation,
      sunshine,
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

    // Prepare request body
    const requestBody = {
      city_code: city,
      date: date.toISOString().split("T")[0],
      rainfall: parseFloat(rainfall),
      humidity: parseFloat(humidity),
      pressure: parseFloat(pressure),
      wind_gust_speed: parseFloat(windspeed),
      uv_index: parseFloat(uv),
    };

    try {
      const response = await fetch("http://localhost:8000/predict_minmax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();

      if (result.status === "success") {
        // Extract dates and temperature data
        const chartData = Object.entries(result.data).map(([key, value]) => ({
          date: new Date(value.Date),
          minTemp: value.MinTemp,
          maxTemp: value.MaxTemp,
        }));

        // Set state with the new chart data
        setChartData(chartData);

        // Find and highlight the main date
        const mainData = chartData.find(
          (d) => d.date.toISOString().split("T")[0] === requestBody.date
        );
        if (mainData) {
          setMinTemp(mainData.minTemp);
          setMaxTemp(mainData.maxTemp);
        }
      } else {
        setError("Failed to retrieve prediction data.");
      }
    } catch (err) {
      setError("Error predicting temperature. Please try again.");
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
          Temperature Predictions Using Multi-Output Regression
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: "justify",
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
          }}
        >
          Multi-output Regression is a supervised ML model that can predict
          multiple variables simultaneously, allowing it to perform more
          efficiently compared to traditional regression models. Using Random
          Forest as the underlying model, we can achieve a model that provides
          over 80% accuracy in daily temperature predictions.
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
                  <MenuItem value="Melbourne">Melbourne</MenuItem>
                  <MenuItem value="Sydney">Sydney</MenuItem>
                  <MenuItem value="Perth">Perth</MenuItem>
                  <MenuItem value="Brisbane">Brisbane</MenuItem>
                  <MenuItem value="Darwin">Darwin</MenuItem>
                  <MenuItem value="Hobart">Hobart</MenuItem>
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
                {/* <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Evaporation (mm)"
                    value={evaporation}
                    onChange={(e) => setEvaporation(e.target.value)}
                    error={!!validationErrors.evaporation}
                    helperText={validationErrors.evaporation}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid> */}
                {/* <Grid item xs={12} sm={3}>
                  <TextField
                    required
                    type="number"
                    label="Sunshine (hours)"
                    value={sunshine}
                    onChange={(e) => setSunshine(e.target.value)}
                    error={!!validationErrors.sunshine}
                    helperText={validationErrors.sunshine}
                    sx={{ minWidth: "200px" }}
                    fullWidth
                  />
                </Grid> */}

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
              {predictedMinTemp !== null && (
                <Typography>
                  Predicted Min Temp: {predictedMinTemp} °C
                </Typography>
              )}
              {predictedMaxTemp !== null && (
                <Typography>
                  Predicted Max Temp: {predictedMaxTemp} °C
                </Typography>
              )}
            </form>
          </Container>
          {chartData && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Temperature Prediction Chart</Typography>
              <ResultsChart
                chartData={chartData}
                mainDate={date.toISOString().split("T")[0]}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
