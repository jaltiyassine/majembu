import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// notifications store
import { useSelector, useDispatch } from 'react-redux';
import { removeNotif } from '../features/notificationsSlice';
import { setTabIndex } from '../features/boolsSlice';

// components
import Home from './main/Home';
import People from './main/People';
import Chats from './main/Chats';
import Register from './main/Register';
import EditProfile from './main/EditProfile';
import SetUpMessage from './main/SetUpMessage';
import ViewMessage from './main/ViewMessage';
import ModifyMessage from './main/ModifyMessage';
import Premium from './main/Premium';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const dispatch = useDispatch();

  let notifications = useSelector(state => state.notifications.notifications);
  let tab = useSelector(state => state.bools.tab);

  const expiredNotifs = React.useMemo(() =>
    notifications
      .filter(notif => Date.now() > notif.dateToShow)
      .sort((a, b) => a.dateToShow - b.dateToShow),
    [notifications]
  );

  const currentNotif = expiredNotifs.length ? expiredNotifs[0] : null;

  const handleClose = () => {
    if (currentNotif) {
      dispatch(removeNotif(currentNotif.id));
    }
  };

  const handleChange = (event, newValue) => {
    dispatch(setTabIndex(newValue));
  };

  const handleExplorePlans = () => {
    if (currentNotif) {
      dispatch(removeNotif(currentNotif.id));
    }
    dispatch(setTabIndex(8));
  };

  return (
    <Box sx={{ width: '100%', minHeight:"450px"}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', color: '#3F3F3F' }}>
        <Tabs value={tab.index} textColor='inherit'
            sx={{
                '& .MuiTabs-indicator': {
                    backgroundColor: '#3F3F3F',
                }
            }}
            variant="fullWidth" onChange={handleChange} aria-label="tabs">
          <Tab label="Home" {...a11yProps(0)} />
          <Tab label="People" {...a11yProps(1)} />
          <Tab label="Chats" {...a11yProps(2)} />
        </Tabs>
      </Box>
      {/* General Notifications */}
      {currentNotif && (
        <Alert
          severity={currentNotif.severity}
          style={{ borderRadius: 0 }}
          onClose={handleClose}
        >
          {currentNotif.message === 429 ? (
            <>
              {"You've exceeded your usage limit. Please upgrade to Premium to continue."}
              <Button
                variant="text"
                color="inherit"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={handleExplorePlans}
                sx={{ ml: 2, mt: { xs: 1, sm: 0 } }}
              >
                Explore Plans
              </Button>
            </>
          ) : currentNotif.message === 400 ? (
            <>Invalid request.</>
          ) : currentNotif.message === 401 ? (
            <>Authentication failed.</>
          ) : currentNotif.message === 403 ? (
            <>Access forbidden.</>
          ) : currentNotif.message === 404 ? (
            <>Requested resource not found.</>
          ) : currentNotif.message === 500 ? (
            <>An internal server error occurred.</>
          ) : currentNotif.message === 502 ? (
            <>A gateway error occurred.</>
          ) : currentNotif.message === 503 ? (
            <>The service is temporarily unavailable.</>
          ) : (
            <>{typeof currentNotif.message === 'string' ? currentNotif.message : "An unexpected error occurred."}</>
          )}
        </Alert>
      )}
      {/* Main pages */}
      <CustomTabPanel value={tab.index} index={0}><Home /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={1}><People /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={2}><Chats /></CustomTabPanel>

      <CustomTabPanel value={tab.index} index={3}><SetUpMessage /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={4}><ViewMessage /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={5}><ModifyMessage /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={6}><Register /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={7}><EditProfile /></CustomTabPanel>
      <CustomTabPanel value={tab.index} index={8}><Premium /></CustomTabPanel>
    </Box>
  );
}