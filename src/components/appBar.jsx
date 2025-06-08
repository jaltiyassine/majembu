import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Notification from '../utils/notification';
import StarsIcon from '@mui/icons-material/Stars';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { useSelector, useDispatch } from 'react-redux';
import { setTabIndex } from '../features/boolsSlice';

function ResponsiveAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  let isLogged = useSelector(state => ((state.user).info).isSet);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: "#3F3F3F"}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters style={{display:'flex', justifyContent: 'space-between'}}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              textAlign: 'left'
            }}
          >Majembu :3</Typography>

          <Box sx={{ flexGrow: 0 }}>
          {isLogged? <>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
            
            <MenuItem onClick={()=>{dispatch(setTabIndex(7));handleClose()}}><PermIdentityIcon />&nbsp;Edit profile</MenuItem>
            <MenuItem onClick={()=>{dispatch(setTabIndex(8));handleClose()}}><StarsIcon />&nbsp;Premium</MenuItem>
            </Menu>
            </>: null}
          </Box>&nbsp;<Notification />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
