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

function ResultsChart({ chartData, chartData2, mainDate }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(600); // Default width

  // Resize observer to make chart responsive
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerWidth;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 50, left: 40 };

    // Chart title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Temperature Forecast");

    // Set up scales to cover the extent of both datasets
    const combinedData = [...chartData, ...chartData2];
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(combinedData, (d) => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(combinedData, (d) => d.minTemp),
        d3.max(combinedData, (d) => d.maxTemp),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Define colors
    const colorScale = d3.scaleOrdinal().range(["steelblue", "orange"]);

    // Line generators for minTemp and maxTemp of `chartData`
    const lineMinTemp1 = d3.line().x((d) => xScale(d.date)).y((d) => yScale(d.minTemp));
    const lineMaxTemp1 = d3.line().x((d) => xScale(d.date)).y((d) => yScale(d.maxTemp));

    // Line generators for minTemp and maxTemp of `chartData2`
    const lineMinTemp2 = d3.line().x((d) => xScale(d.date)).y((d) => yScale(d.minTemp));
    const lineMaxTemp2 = d3.line().x((d) => xScale(d.date)).y((d) => yScale(d.maxTemp));

    // Draw lines for `chartData`
    svg
      .append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", colorScale(0))
      .attr("stroke-width", 1.5)
      .attr("d", lineMinTemp1);

    svg
      .append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", colorScale(0))
      .attr("stroke-width", 1.5)
      .attr("d", lineMaxTemp1)
      .style("stroke-dasharray", "5,5"); // Optional: dashed for maxTemp

    // Draw lines for `chartData2`
    svg
      .append("path")
      .datum(chartData2)
      .attr("fill", "none")
      .attr("stroke", colorScale(1))
      .attr("stroke-width", 1.5)
      .attr("d", lineMinTemp2);

    svg
      .append("path")
      .datum(chartData2)
      .attr("fill", "none")
      .attr("stroke", colorScale(1))
      .attr("stroke-width", 1.5)
      .attr("d", lineMaxTemp2)
      .style("stroke-dasharray", "5,5");

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Date");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -30)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Temperature (°C)");

    // Tooltip for hover
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Add hoverable points for both datasets
    const addHoverCircles = (data, color) => {
      svg
        .selectAll(`.data-point-${color}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `data-point-${color}`)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.maxTemp))
        .attr("r", 5)
        .attr("fill", color)
        .on("mouseover", function (event, d) {
          const [offsetX, offsetY] = d3.pointer(event);

          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Date:</strong> ${d.date.toDateString()}<br>
                     <strong>Min Temp:</strong> ${d.minTemp}°C<br>
                     <strong>Max Temp:</strong> ${d.maxTemp}°C`
            )
            .style("left", `${offsetX + 10}px`)
            .style("top", `${offsetY - 30}px`);

          d3.select(this).attr("r", 7).attr("fill", "darkorange");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this).attr("r", 5).attr("fill", color);
        });
    };

    addHoverCircles(chartData, colorScale(0));
    addHoverCircles(chartData2, colorScale(1));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 100},${margin.top})`
      );

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale(0));

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text("Forecast Data")
      .attr("alignment-baseline", "middle");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale(1));

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 30)
      .text("Training Data")
      .attr("alignment-baseline", "middle");
  }, [chartData, chartData2, mainDate, containerWidth]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "600px", background: "white" }}>
      <svg ref={svgRef} width={containerWidth} height={400}></svg>
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
  const [windspeed, setWindspeed] = useState("");
  const [uv, setUv] = useState("");

  const [predictedMinTemp, setMinTemp] = useState(null);
  const [predictedMaxTemp, setMaxTemp] = useState(null);

  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
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

        const chartData2 = Object.entries(result.training_data).map(([key, value]) => ({
          date: new Date(value.Date),
          minTemp: value.MinTemp,
          maxTemp: value.MaxTemp,
        }));

        // Set state with the new chart data
        setChartData(chartData);
        setChartData2(chartData2);

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
          over 80% accuracy in daily temperature predictions. Within the visualisation,
          Minimum temperature is marked with a straight continuous line, where Maximum temperature
          is visualised using a dashed line. The tooltip is available as the mouse is hovered to show
          the detailed min and max temperature for the date.
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

                {/* Pressure, Windspeed, and  UV Input*/}
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
                chartData2={chartData2}
                mainDate={date.toISOString().split("T")[0]}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
