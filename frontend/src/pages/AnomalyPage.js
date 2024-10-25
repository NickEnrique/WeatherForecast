import React, { useState } from 'react';
import {
    Typography, Box, Container, Paper, MenuItem, Grid2 as Grid, TextField, Button
} from '@mui/material';

//for formatting date input field
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export default function Anomaly() {
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submitForm = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // declare chart stuff here
            const newChartData = {};

        } catch (err) {
            setError('Error detecting anomalies. Please try again.');
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
                    Anomaly Detection Using Isolation Forest
                </Typography>
                <Typography
                    variant='subtitle1'
                    sx={{ textAlign: 'justify', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                >
                    Isolation Forest is an unsupervised machine-learning algorithm used for anomaly detection.
                    This model is used to analyse and detect anomalous data for each weather variable.
                    By visualising the anomalies, we can uncover relationships between
                    weather variables, which is useful for predicting severe weather events.
                </Typography>
                <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
                    <Typography sx={{ textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600, mb: 2 }}>
                        Try the Model
                    </Typography>
                    <Container sx={{ m: 1 }}>
                        <form onSubmit={submitForm}>
                            {/* City Input */}
                            <Container sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <TextField
                                    select
                                    required
                                    label="Select City"
                                    value={city}
                                    sx={{ minWidth: '245px' }}
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
                                <Grid item lg={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="Start Date (MM/DD/YY)"
                                            value={startDate}
                                            onChange={(newValue) => setStartDate(newValue)}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item lg={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            label="End Date (MM/DD/YY)"
                                            value={endDate}
                                            onChange={(newValue) => setEndDate(newValue)}
                                            renderInput={(params) => <TextField {...params} />}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>

                            <Container sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button type="submit" variant="contained" color="primary">
                                    Submit
                                </Button>
                            </Container>

                            {loading && <Typography variant='body2'>Loading...</Typography>}
                            {error && <Typography variant='body2' color='error'>{error}</Typography>}
                        </form>
                    </Container>
                </Paper>
            </Container>
        </Box>
    );
}
