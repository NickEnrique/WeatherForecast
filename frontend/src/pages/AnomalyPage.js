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

function ResultsChart({ chartData, chartData2, mainDate }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Calculate width based on container size
    const containerWidth = svgRef.current.parentNode.clientWidth;
    const width = containerWidth > 600 ? 600 : containerWidth - 20; // Set a max width
    const height = 400;
    const margin = { top: 40, right: 80, bottom: 60, left: 40 };

    // Chart title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Maximum Temperature Anomaly");

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

    const colorScale = d3.scaleOrdinal().range(["steelblue", "orange"]);

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const addScatterPoints = (data, color) => {
      svg
        .selectAll(`.data-point-${color}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `data-point-${color}`)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.maxTemp))
        .attr("r", 5)
        .attr("fill", (d) => {
          if (d.anomaly === "Yes") return "red";
          if (d.anomaly === "No") return "green";
          return "steelblue";
        })
        .on("mouseover", function (event, d) {
          const [offsetX, offsetY] = d3.pointer(event);
          tooltip
            .style("opacity", 1)
            .html(
              `
              <strong>Date:</strong> ${d.date.toDateString()}<br>
              <strong>Max Temp:</strong> ${d.maxTemp}°C<br>
              <strong>Anomaly:</strong> ${d.anomaly}<br>
              <strong>Anomaly Score:</strong> ${d.score}°C<br>
               `
            )
            .style("left", `${offsetX + 10}px`)
            .style("top", `${offsetY - 30}px`);

          d3.select(this).attr("r", 7).attr("fill", "darkorange");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this)
            .attr("r", 5)
            .attr("fill", (d) => {
              if (d.anomaly === "Yes") return "red";
              if (d.anomaly === "No") return "green";
              return "steelblue";
            });
        });
    };

    addScatterPoints(chartData, colorScale(0));
    addScatterPoints(chartData2, colorScale(1));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d")))
      .selectAll("text")  // Select all text elements for the x-axis
      .style("text-anchor", "end")  // Set the text anchor to the end
      .attr("transform", "rotate(-45)")  // Rotate the text
      .attr("dx", "-0.8em")  // Adjust the x-position
      .attr("dy", "0.15em");  // Adjust the y-position


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

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right - 130},${margin.top})`);

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
      .text("Training Data")
      .attr("alignment-baseline", "middle");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "red");
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 30)
      .text("Forecast Data - Anomaly")
      .attr("alignment-baseline", "middle");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "green");
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 50)
      .text("Forecast Data - Non-Anomaly")
      .attr("alignment-baseline", "middle");
  }, [chartData, chartData2, mainDate]);

  return (
    <div style={{ position: "relative", background: "white" }}>
      <svg ref={svgRef} width="100%" height={500}></svg>
      <div
        ref={tooltipRef}
        style={{ position: "absolute", opacity: 0, zIndex: "999", top: "0" }}
      ></div>
    </div>
  );
}



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
  const [chartData2, setChartData2] = useState(null);
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
        const chartData = Object.entries(result.data).map(([key, value]) => ({
          date: new Date(value.Date),
          maxTemp: value.MaxTemp,
          anomaly: value.anomaly, // Include the anomaly value
          score: value.score
        }));

        const chartData2 = Object.entries(result.training_data).map(
          ([key, value]) => ({
            date: new Date(value.Date),
            minTemp: value.MinTemp,
            maxTemp: value.MaxTemp,
          })
        );

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
          which is useful for predicting severe weather events. Within the visualisation, 
          if there is an anomaly, the input data will be flagged with a different color.
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
            <Typography variant="h6">Maximum Temperature Anomaly</Typography>
            <ResultsChart
              chartData={chartData}
              chartData2={chartData2}
              mainDate={date.toISOString().split("T")[0]}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
