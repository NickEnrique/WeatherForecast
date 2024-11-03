import React, { useState } from "react";
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

export default function Classification() {
  const [city, setCity] = useState("");
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null); // Store data for chart rendering

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

    try {
      const cityCodeMap = {
        Melbourne: "MEL",
        Sydney: "SYD",
        Perth: "PER",
        Brisbane: "BRI",
        Darwin: "DAR",
        Hobart: "HOB",
      };
      const cityCode = cityCodeMap[city];
      const formattedDate = date ? date.toISOString().split("T")[0] : "";

      const response = await fetch(
        "http://localhost:8000/classification_predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city_code: cityCode,
            date: formattedDate,
          }),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        setChartData(result.data); // Store response data for chart rendering
        createPieCharts(result.data, formattedDate);
      } else {
        setError("Failed to get prediction data");
      }
    } catch (err) {
      setError("Error with classifying weather. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createPieCharts = (data, mainDate) => {
    // Remove any previous chart SVGs
    d3.select("#dayForecastChart").selectAll("*").remove();
    d3.select("#nightForecastChart").selectAll("*").remove();

    // Helper function to calculate forecast counts
    const getForecastCounts = (time) => {
      const counts = {};
      Object.keys(data).forEach((date) => {
        const forecast = data[date][`${time}_forecast`];
        counts[forecast] = (counts[forecast] || 0) + 1;
      });
      return Object.entries(counts).map(([forecast, count]) => ({
        forecast,
        count,
      }));
    };

    // Day and Night data for pie charts
    const dayData = getForecastCounts("day");
    const nightData = getForecastCounts("night");

    // Dimensions and radius for pie chart
    const width = 250;
    const height = 250;
    const radius = Math.min(width, height) / 2;

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Pie function and arc generator
    const pie = d3.pie().value((d) => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Tooltip setup
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("border", "1px solid #ccc")
      .style("display", "none");

    const drawChart = (chartData, id) => {
      const svg = d3
        .select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      svg
        .selectAll("path")
        .data(pie(chartData))
        .join("path")
        .attr("d", arc)
        .attr("fill", (d) => colorScale(d.data.forecast))
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(`<strong>${d.data.forecast}</strong>: ${d.data.count} days`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 40 + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"))
        .attr("stroke", (d) =>
          d.data.forecast === data[mainDate].day_forecast ? "black" : "none"
        )
        .attr("stroke-width", (d) =>
          d.data.forecast === data[mainDate].day_forecast ? 2 : 0
        ); // Highlight main date forecast
    };

    drawChart(dayData, "dayForecastChart");
    drawChart(nightData, "nightForecastChart");
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
          Weather Classification Using Random Forest
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: "justify",
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
          }}
        >
          Random Forest is a supervised machine learning algorithm widely used for classification tasks. 
          It improves accuracy and reduces the likelihood of overfitting. Applied to weather classification, 
          this model categorizes different weather conditions based on various features such as 
          temperature, humidity, wind speed, and season. The insights gained from this classification help us understand 
          patterns in weather conditions, which can support forecasting and decision-making for weather-dependent activities.
          Within the visualisation, the left pie chart represents the trend of weather type for the day forecast, whereas the 
          right pie chart depicts the overall trend of weather types for the night forecast.
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
              <Grid
                container
                spacing={2}
                sx={{ display: "flex", justifyContent: "center", mb: 3 }}
              >
                <Grid item lg={6}>
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
                </Grid>
                <Grid item lg={6}>
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
              </Grid>

              <Container sx={{ display: "flex", justifyContent: "center" }}>
                <Button type="submit" variant="contained" color="primary" disabled={!!error || !date}>
                  Submit
                </Button>
              </Container>

              {loading && <Typography variant="body2">Loading...</Typography>}
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
            </form>
          </Container>
        </Paper>
        {/* Day and Night Forecast Charts */}
        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 4 }}>
          <div id="dayForecastChart" />
          <div id="nightForecastChart" />
        </Box>
      </Container>
    </Box>
  );
}
