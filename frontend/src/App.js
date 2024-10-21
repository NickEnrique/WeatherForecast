import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box,
  Drawer, List, ListItem, ListItemText, IconButton, Snackbar}
from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Add as AddIcon,
} from '@mui/icons-material';

//import different pages 
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
    <Box sx={{ width: 250 , mt:2}} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem  button component={Link} to='/'>
          <ListItemText primary='Home' />
        </ListItem>

        <ListItem  button component={Link} to='/prediction'>
          <ListItemText primary='Temperature Prediction' />
        </ListItem>

        <ListItem  button component={Link} to='/anomaly'>
          <ListItemText primary='Anomaly Detection' />
        </ListItem>
      
      </List>
    </Box>
  );

  // Home page component
  const Home = () =>{
    return(<h1>Home Page</h1>)
  }

  return (
    <ErrorBoundary>
      <Box>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Weather Analysis 
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            {drawerContent}
          </Drawer>
      <Routes>
        <Route path = "/" element={<Box sx={{m:3}}><Home/></Box>}/>
        <Route path="/prediction" element={<Box sx={{m:3}}><Prediction/></Box>} />
        <Route path="/anomaly" element={<Box sx={{m:3}}><Anomaly/></Box>} />
      </Routes>
    </Box>
    </ErrorBoundary>
  );
}
export default App;
