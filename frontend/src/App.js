
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemText, IconButton,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Thermostat as ThermoIcon,
  WbSunny as SunIcon,
  QueryStats as AnomalyIcon,
  CloudOutlined as CloudIcon,
} from '@mui/icons-material';

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
            '&:hover': {
              bgcolor: '#4c97cd',
              fontWeight: 'bold',
              color: 'white',
            }}}>
          <ListItemIcon>
            {index === 0 ? <HomeIcon /> :
              index === 1 ? <ThermoIcon /> :
              index === 2 ? <CloudIcon /> :
              <AnomalyIcon />}
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
        ))}
      </List>
  </Box>
);

// Home page component
const Home = () => {
  return (<h1>Home Page</h1>);
}

return (
  <ErrorBoundary>
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: "#6dbcf0" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "uppercase", color: '#175383' }}>
              Weather Analysis
            </Typography>
            <SunIcon sx={{ ml: 1, color: 'yellow' }} />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 2, minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<Box sx={{ m: 3 }}><Home /></Box>} />
          <Route path="/prediction" element={<Box sx={{ m: 3 }}><Prediction /></Box>} />
          <Route path="/classification" element={<Box sx={{ m: 3 }}><Classification /></Box>} />
          <Route path="/anomaly" element={<Box sx={{ m: 3 }}><Anomaly /></Box>} />
        </Routes>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, bgcolor: "#6dbcf0" }}>
        <Typography sx={{ fontWeight: 600, textAlign: "center", color: "#175383" }}>Team 8 - Innovation</Typography>
        <Typography sx={{ textAlign: 'center', marginTop: 1 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sagittis, quam et volutpat sollicitudin, lacus lectus blandit odio, sit amet mollis tortor nunc ac leo. Integer at varius ipsum.
        </Typography>
        <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1, color: '#175383' }}>
          © 2024 Team 8 Innovation. All rights reserved.
        </Typography>
      </Box>
    </Box>
  </ErrorBoundary>
);
}

export default App;
