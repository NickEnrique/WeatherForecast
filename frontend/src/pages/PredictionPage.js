import React, { useState } from 'react';
import {
   Typography, Box, Container, Paper, MenuItem, Grid2 as Grid, TextField, Button
} from '@mui/material';

//for formatting date input field
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export default function Prediction() {
    const [city, setCity] = useState('');
    const [date, setDate] = useState(null);
    const [rainfall, setRainfall] = useState('');
    const [humidity, setHumidity] = useState('');
    const [pressure, setPressure] = useState('');
    const [evaporation, setEvaporation] = useState('');
    const [sunshine, setSunshine] = useState('');
    const [windspeed, setWindspeed] = useState('');
    const [uv, setUv] = useState('');

    const [predictedMinTemp, setMinTemp] = useState(null);
    const [predictedMaxTemp, setMaxTemp] = useState(null);

    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const submitForm = async (e) => {
        e.preventDefault();
        setError('');
        setMinTemp(null);
        setMaxTemp(null);
        setLoading(true);
        setValidationErrors({});

        // Validate inputs are not negative
        const errors = {};
        const features = { rainfall, humidity, pressure, evaporation, sunshine, windspeed, uv };

        Object.keys(features).forEach(f => {
            if (features[f] < 0) {
                errors[f] = 'Value cannot be negative';
            }
        });

        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setLoading(false);
            return;
        }

        try {
           //declare chart stuff here
            const newChartData = {};
        
        } catch (err) {
            setError('Error predicting temperature. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ m: 4 }}>
            <Container>
                <Typography
                    variant='h6'
                    sx={{ textAlign: 'center', fontWeight: '600', m: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}
                >
                    Temperature Predictions Using Multi-Output Regression
                </Typography>
                <Typography
                    variant='subtitle1'
                    sx={{ textAlign: 'justify', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                >
                    Multi-output Regression is a supervised ML model that can predict multiple variables simultaneously, allowing it to perform more efficiently compared to traditional regression models.
                    Using Random Forest as the underlying model, we can achieve a model that provides over 80% accuracy in daily temperature predictions.
                </Typography>
                <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
                    <Typography sx={{ textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600, mb: 2 }}>Try the Model</Typography>
                    <Container sx={{ m: 1 }}>
                        <form onSubmit={submitForm}>
                            {/* City Input */}
                            <Container sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <TextField
                                    select
                                    required
                                    label="Select City"
                                    value={city}
                                    sx={{ minWidth: '200px' }}
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

                            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                {/* Date, Rainfall, Humidity Input */}
                                <Grid item xs={12} sm={3}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Date (MM/DD/YY)"
                                            value={date}
                                            onChange={(newValue) => setDate(newValue)}
                                            renderInput={(params) => <TextField {...params}/>}
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
                                        sx={{ minWidth: '200px' }}
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
                                        sx={{ minWidth: '200px' }}
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
                                        sx={{ minWidth: '200px' }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        required
                                        type="number"
                                        label="Evaporation (mm)"
                                        value={evaporation}
                                        onChange={(e) => setEvaporation(e.target.value)}
                                        error={!!validationErrors.evaporation} 
                                        helperText={validationErrors.evaporation} 
                                        sx={{ minWidth: '200px' }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        required
                                        type="number"
                                        label="Sunshine (hours)"
                                        value={sunshine}
                                        onChange={(e) => setSunshine(e.target.value)}
                                        error={!!validationErrors.sunshine} 
                                        helperText={validationErrors.sunshine} 
                                        sx={{ minWidth: '200px' }}
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
                                        sx={{ minWidth: '200px' }}
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
                                        sx={{ minWidth: '200px' }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>

                            <Container sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button type="submit" variant="contained" color="primary">
                                    Submit
                                </Button>
                            </Container>

                            {/* results and data visualisation goes here */}
                            {loading && <Typography variant='body2'>Loading...</Typography>}
                            {error && <Typography variant='body2' color='error'>{error}</Typography>}
                            {predictedMinTemp !== null && (
                                <Typography >
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
                </Paper>
            </Container>
        </Box>
    );
}
