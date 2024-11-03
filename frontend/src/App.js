
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemText, IconButton,
  ListItemIcon, Grid2 as Grid, Card, CardContent, Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Thermostat as ThermoIcon,
  WbSunny as SunIcon,
  QueryStats as AnomalyIcon,
  CloudOutlined as CloudIcon,
} from '@mui/icons-material';


import './App.css'
import skyImage from './images/sky.jpg';

// Import different pages 
import Classification from './pages/ClassificationPage';
import Anomaly from "./pages/AnomalyPage";
import Prediction from "./pages/PredictionPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  //creating navigation drawer
  const drawerContent = (
    <Box 
    sx={{ 
      width: 300, 
      pt: 2, 
      bgcolor: "#6dbcf0", 
      height: '100%'  // Ensures the box takes the full height of the drawer
    }} 
    role="presentation" 
    onClick={toggleDrawer(false)}>
    <List>
        {['Home', 'Temperature Prediction', 'Weather Classification', 'Anomaly Detection'].map((text, index) => (
        <ListItem
          button
          component={Link}
          to={index === 0 ? '/' : index === 1 ? '/prediction' : index === 2 ? '/classification' : '/anomaly'}
          key={text}
          sx={{
            p: 2,
            color: "#175383",
            '&:hover': {
              bgcolor: '#4c97cd',
              fontWeight: 'bold',
              color: 'white',
            },
            '&:hover .MuiListItemIcon-root': { // change icon color on hover
              color: 'white', 
            },
            '&:visited':{
              color:'none'
            }
            
          }}>
          <ListItemIcon>
            {index === 0 ? <HomeIcon /> :
              index === 1 ? <ThermoIcon /> :
              index === 2 ? <CloudIcon /> :
              <AnomalyIcon />}
          </ListItemIcon>
          <ListItemText primary={text}/>
        </ListItem>
        ))}
      </List>
  </Box>
);

// Home page component
const Home = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    {/* Box with Background Image */}
    <Box
  sx={{
    backgroundImage: `url(${skyImage})`,
    height: '30vh',
    backgroundSize: 'cover',
    display: 'flex',
    flexDirection: 'column', // Stack children vertically
    justifyContent: 'flex-start', // Align items to the start (top)
    alignItems: 'center', // Center items horizontally
    color: 'white', // Set text color
    textAlign: 'center', // Center text
    padding: 2, // Add some padding
  }}
>
  <Typography 
    variant="h4" 
    sx={{ mt: 2, fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}
  >
    Team 8 - Innovation
  </Typography>
  
  <Typography 
    variant="caption" 
    sx={{ mt: 1 }} // Add margin-top to create space between title and caption
  >
    Weather forecasting has been a crucial service that affects agriculture, transportation, and daily activities. 
    It helps people organize their everyday activities and empower authorities to take action during extreme weather 
    conditions by entailing atmospheric parameters such as temperature, rainfall, wind speed, humidity, pressure and UV index. 
    Thus, decision-making depends on these forecasts being accurate. Machine Learning (ML) models have proven to be effective in 
    enhancing the precision of weather analysis.
  </Typography>
</Box>
    <Box sx={{ pt: 2 }}>
    <Typography variant="h5" sx={{textAlign:'center', m:1, fontweight:'bold'}}>Meet the Team</Typography>
    <Grid container justifyContent="space-evenly" sx={{m:2}}>
        {/* Each card takes full width on small screens and 4/12 on medium and larger */}
        <Grid item xs={12} md={4}  sx={{mb:4}}>
          <Card sx={{ width:'230px', height: '100%', display: 'flex', flexDirection: 'column',border:'2px solid #c1dff6' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{textAlign:'center'}}>Levin Fubex</Typography>
              <Divider/>
              <Typography variant="subtitle2" sx={{mt:1}}>
                <span style={{ fontWeight: 'bold' }}>Student ID:</span> 103534612
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Degree:</span> BA-CS
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Major:</span> Software Development
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Task:</span> D3 Visualisation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}  sx={{mb:4}}>
        <Card sx={{width:'230px', height: '100%', display: 'flex', flexDirection: 'column',border:'2px solid #c1dff6' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{textAlign:'center'}}>Muy Houng Leang</Typography>
              <Divider/>
              <Typography variant="subtitle2"  sx={{mt:1}}>
                <span style={{ fontWeight: 'bold' }}>Student ID:</span> 104356422
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Degree:</span> BA-CS
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Major:</span> Software Development and Cybersecurity
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Task:</span> Frontend Development
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sx={{mb:4}} >
        <Card sx={{ width:'230px', height: '100%', display: 'flex', flexDirection: 'column',border:'2px solid #c1dff6' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{textAlign:'center'}}>Nick Enrique Wijaya</Typography>
              <Divider/>
              <Typography variant="subtitle2"  sx={{mt:1}}>
                <span style={{ fontWeight: 'bold' }}>Student ID:</span> 104066763
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Degree:</span> BA-CS
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Major:</span> Data Science
              </Typography>
              <Typography variant="subtitle2">
                <span style={{ fontWeight: 'bold' }}>Task:</span> Modification of ML Models, Back-End Development, API Integrations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  </Box>

  );
}

return (
  <ErrorBoundary>
   <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
  <AppBar position="static" sx={{ bgcolor: "#6dbcf0" }}>
    <Toolbar sx={{ justifyContent: "space-between"}}>
      <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
        <Typography sx={{ fontWeight: 600, textTransform: "uppercase", color: '#175383', fontSize:{xs:'0.9rem',md:'1.2rem'} }}>
          Weather Analysis
        </Typography>
        <SunIcon sx={{ ml: 1, color: 'yellow' }} />
      </Box>
    </Toolbar>
  </AppBar>

  {/* Second AppBar below the first one */}
  {/*Only appears for sm screens and above */}
  <AppBar position="static" sx={{bgcolor:"#c1dff6", display:{xs:'none', sm:'block'}}}>
    <Toolbar sx={{justifyContent: "space-evenly"}}>
    <NavLink to="/" className="navlink">
      <Typography sx={{fontWeight:'bold',fontSize:{sm:'0.9rem',md:'1rem'},}}>Home</Typography>
    </NavLink>
      <NavLink to="/prediction"  className="navlink">
        <Typography sx={{fontWeight:"bold" ,fontSize:{sm:'0.9rem',md:'1rem'}}}>Temperature Prediction</Typography>
      </NavLink>
      <NavLink to="/classification"  className="navlink">
        <Typography sx={{fontWeight:"bold" ,fontSize:{sm:'0.9rem',md:'1rem'}}}>Weather Classification</Typography>
      </NavLink>
      <NavLink to="/anomaly"className="navlink"> 
        <Typography sx={{fontWeight:"bold" ,fontSize:{sm:'0.9rem',md:'1rem'}}}>Anomaly Detection</Typography>
      </NavLink>
    </Toolbar>
  </AppBar>

  <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
    {drawerContent}
  </Drawer>

  <Box sx={{ flexGrow: 1, minHeight: 0 }}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/prediction" element={<Prediction/>} />
      <Route path="/classification" element={<Classification />}/>
      <Route path="/anomaly" element={<Anomaly />} />
    </Routes>
  </Box>

  {/* Footer */}
  <Box sx={{ p: 2, bgcolor: "#6dbcf0" }}>
    <Typography sx={{ fontWeight: 600, textAlign: "center", color: "#175383",fontSize:{xs:'0.9rem',md:'1rem'} }}>Team 8 - Innovation</Typography>
    <Typography sx={{ textAlign: 'center', marginTop: 1 ,fontSize:{xs:'0.8rem',md:'1rem'}}}>
      Levin Fubex - Muy Houng Leang - Nick Enrique Wijaya
    </Typography>
    <Typography sx={{ fontSize:{xs:10,md:12}, textAlign: 'center', mt: 1, color: '#175383' }}>
      © 2024 Team 8 Innovation. All rights reserved.
    </Typography>
  </Box>
</Box>

  </ErrorBoundary>
);
}

export default App;
