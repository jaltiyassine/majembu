import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useDispatch, useSelector } from 'react-redux';
import { setHasEmail } from '../../features/boolsSlice';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const tiersData = [
  {
    name: 'Free',
    messages: 10,
    priceUSD: 0,
    priceLabel: '$0',
    description: 'Perfect for getting started and exploring basic features.',
    features: [
      '10 AI-generated messages',
      'Standard response quality',
    ],
    buttonText: 'Select Plan',
    isCurrent: true,
    cardStyle: {
      borderColor: 'primary.main',
      borderWidth: '1.5px',
      boxShadow: 2,
    },
    headerStyle: {
      color: 'primary.main',
    }
  },
  {
    name: 'Silver',
    messages: 100,
    priceUSD: 4.99,
    priceLabel: '$4.99 one-time',
    description: 'Ideal for regular users needing more interactions and consistency without breaking the bank.',
    features: [
      '100 AI-generated messages',
      'Improved response quality',
    ],
    buttonText: 'Get Silver Pack',
    isCurrent: false,
    cardStyle: {
      borderColor: 'grey.400',
      borderWidth: '1px',
      boxShadow: 1,
    },
    headerStyle: {
      color: 'grey.700',
    }
  },
  {
    name: 'Gold',
    messages: 300,
    priceUSD: 9.99,
    priceLabel: '$9.99 one-time',
    description: 'Best value for power users who rely heavily on AI and demand better quality and flexibility.',
    features: [
      '300 AI-generated messages',
      'Premium response quality',
    ],
    buttonText: 'Get Gold Pack',
    isPopular: true,
    isCurrent: false,
    cardStyle: {
      borderColor: '#FFC107',
      borderWidth: '2px',
      boxShadow: 6,
    },
    headerStyle: {
      color: '#B28000',
    },
    popularChipColor: 'warning'
  },
  {
    name: 'Diamond',
    messages: 700,
    priceUSD: 19.99,
    priceLabel: '$19.99 one-time',
    description: 'Designed for extensive usage, offering maximum message capacity and the highest quality responses.',
    features: [
      '700 AI-generated messages',
      'Top-tier response quality',
    ],
    buttonText: 'Get Diamond Pack',
    isCurrent: false,
    cardStyle: {
      borderColor: 'info.main',
      borderWidth: '2px',
      boxShadow: 4,
    },
    headerStyle: {
      color: 'info.dark',
    }
  },
];

export default function Premium() {
  const [tiers, setTiers] = React.useState(tiersData);
  const currentUser = useSelector((state) => state.user.info);
  let configMessages = useSelector(state => state.configMessages.configMessages);
  let hasEmail = useSelector((state) => state.bools.hasEmail);
  const [limitMessages, setLimitMessages] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingValidate, setIsLoadingValidate] = React.useState(false);
  const dispatch = useDispatch();

  // State for the dialog
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTierNameForDialog, setSelectedTierNameForDialog] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  React.useEffect(() => {
    const fetchTier = async () => {
      try {
        const res = await fetch('https://gen-hub.fun/check_tier.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                API_KEY: currentUser.API_KEY
            }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setTiers(prevTiers =>
            prevTiers.map(t => ({
                ...t,
                isCurrent: t.name === data.tier,
            }))
        );
        setLimitMessages(data.limit_messages);
      } catch (err) {
        console.error("Failed to fetch tier:", err);
        setTiers(prevTiers =>
            prevTiers.map(t => ({
                ...t,
                isCurrent: t.name === 'Free',
            }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && currentUser.API_KEY) {
      setIsLoading(true);
      fetchTier();
    } else {
      setTiers(prevTiers =>
        prevTiers.map(t => ({
            ...t,
            isCurrent: t.name === 'Free',
        }))
      );
      setIsLoading(false);
    }
  }, [currentUser, configMessages]);

  const handleChoosePlan = async (tierName) => {
    setSelectedTierNameForDialog(tierName);
    if(!hasEmail){
      setEmail('');
      setEmailError('');
      setDialogOpen(true);

    }else{
      setIsLoading(true);
      try {
        const payload = {
          email: null,
          tierName: tierName,
          API_KEY: currentUser.API_KEY,
        };
    
        const res = await fetch('https://gen-hub.fun/req_live_chat.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
    
        const data = await res.json();
    
        if (!res.ok) {
          const errorMessage = data?.error || `Request failed: ${res.status} ${res.statusText}`;
          console.error("API Error:", errorMessage, data);
    
        } else {
          if (data.success) {
            chrome.tabs.create({ url: "https://tawk.to/majembu" });
          } else {
            console.error("API Success, but no URL in response:", data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch or process request:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  const validateEmailFormat = (emailToValidate) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleDialogValidate = async () => {
    setEmailError('');
    let emailInput = email.trim();
    let emailToSendInPayload = null;
  
    if (emailInput) {
      if (!validateEmailFormat(emailInput)) {
        setEmailError('Please enter a valid email address.');
        return;
      }
      emailToSendInPayload = emailInput;
    }
  
    setIsLoadingValidate(true);
  
    try {
      const payload = {
        email: emailToSendInPayload,
        tierName: selectedTierNameForDialog,
        API_KEY: currentUser.API_KEY,
      };
  
      const res = await fetch('https://gen-hub.fun/req_live_chat.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        const errorMessage = data?.error || `Request failed: ${res.status} ${res.statusText}`;
        console.error("API Error:", errorMessage, data);
  
        if (data?.error && data.error.toLowerCase()) {
          setEmailError(data.error);
        }
      } else {
        if (data.success) {
          dispatch(setHasEmail(true));
          chrome.tabs.create({ url: "https://tawk.to/majembu" });
          handleDialogClose();
        } else {
          console.error("API Success, but no URL in response:", data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch or process request:", err);
    } finally {
      setIsLoadingValidate(false);
    }
  };

  const currentActivePlan = React.useMemo(() =>
    tiers.find(t => t.isCurrent === true) || tiers.find(t => t.name === 'Free'),
  [tiers]);

  const displayTiers = React.useMemo(() => {
    return [...tiers].sort((a, b) => {
      if (a.name === currentActivePlan?.name) return -1;
      if (b.name === currentActivePlan?.name) return 1;
      const orderValue = (plan) => {
        if (plan.name === 'Free') return 0;
        if (plan.name === 'Silver') return 1;
        if (plan.name === 'Gold') return 2;
        if (plan.name === 'Diamond') return 3;
        return 4;
      };
      return orderValue(a) - orderValue(b);
    });
  }, [tiers, currentActivePlan]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto',
          padding: { xs: 2, sm: 3 },
          maxWidth: 1200,
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        margin: 'auto',
        padding: { xs: 2, sm: 3 },
        maxWidth: 1200,
      }}
    >
      <Grid container spacing={3} alignItems="stretch">
        {displayTiers.map((tier) => {
          const isThisTierCurrent = tier.name === currentActivePlan?.name;

          let buttonText = tier.buttonText;
          if (isThisTierCurrent) {
            buttonText = currentActivePlan?.name === 'Free' ? 'Current Free Plan' : 'Your Current Pack';
          }

          const isButtonDisabled = tier.name === 'Free';

          return (
            <Grid item xs={12} sm={6} md={3} key={tier.name} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  borderStyle: 'solid',
                  position: 'relative',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: isThisTierCurrent || isButtonDisabled ? 'none' : 'scale(1.03)',
                    boxShadow: isThisTierCurrent ? tier.cardStyle.boxShadow :
                               isButtonDisabled ? tier.cardStyle.boxShadow : (tier.cardStyle.boxShadow || 0) + 3,
                  },
                  ...tier.cardStyle,
                  borderColor: isThisTierCurrent ? (tier.name === 'Free' ? 'primary.main' : tier.cardStyle.borderColor) : tier.cardStyle.borderColor,
                  borderWidth: isThisTierCurrent ? '2.5px' : tier.cardStyle.borderWidth,
                }}
              >
                {isThisTierCurrent && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Selected Plan"
                    color={tier.name === "Free" ? "primary" :
                           tier.name === "Gold" ? "warning" :
                           tier.name === "Diamond" ? "info" :
                           "success"
                          }
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 'bold',
                      zIndex: 1,
                      ...(tier.name === 'Gold' && {
                        backgroundColor: '#FFC107',
                        color: 'common.black',
                      }),
                    }}
                  />
                )}
                {tier.isPopular && !isThisTierCurrent && (
                  <Chip
                    icon={<StarIcon />}
                    label="Most Popular"
                    color={tier.popularChipColor || 'primary'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 'bold',
                      backgroundColor: tier.popularChipColor === 'warning' ? '#FFC107' : undefined,
                      color: tier.popularChipColor === 'warning' ? 'common.black' : undefined,
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, p: 2.5, pt: isThisTierCurrent ? 5 : 2.5}}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ color: tier.headerStyle.color, fontWeight: 'medium' }}>
                    {tier.name}
                  </Typography>
                  <Typography variant="h4" color="text.primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {tier.priceLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: {sm: 60, md: 80} }}>
                    {tier.description}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
                    Includes:
                  </Typography>
                  <List dense disablePadding>
                    {tier.features.map((feature, index) => (
                      <ListItem key={index} disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <CheckCircleOutlineIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                      </ListItem>
                    ))}
                  </List>

                <Typography variant="caption" display="block" sx={{ mt: 2.5, fontStyle: 'italic', textAlign: 'center' }}>
                    {(tier.isCurrent)? limitMessages+" out of "+tier.messages+" AI messages used" : (tier.name !== "Free")? "Notice: You can request this package as many times as you like." : null}
                </Typography>

                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: 2, pt: 1 }}>
                  <Button
                    fullWidth
                    variant={isThisTierCurrent ? 'outlined' : 'contained'}
                    color={
                      tier.name === "Gold" ? "warning" :
                      tier.name === "Diamond" ? "info" :
                      tier.name === "Silver" ? (isThisTierCurrent ? "inherit" : "inherit") :
                      "primary"
                    }
                    onClick={() => handleChoosePlan(tier.name)}
                    disabled={isButtonDisabled}
                    sx={{
                      py: 1.2,
                      fontWeight: 'bold',
                      ...(tier.name === "Silver" && !isThisTierCurrent && {
                        backgroundColor: 'grey.200',
                        color: 'black',
                        '&:hover': { backgroundColor: 'grey.300' }
                      }),
                      ...(tier.name === "Silver" && isThisTierCurrent && {
                        borderColor: 'grey.500',
                        color: 'grey.700',
                      })
                    }}
                  >
                    {buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Dialog for Email Input */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Get {selectedTierNameForDialog} Pack</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To proceed with the {selectedTierNameForDialog} pack, please enter your email address.<br/>
            →&nbsp;After that, you will be redirected to a live chat with our agent to confirm your order.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError || " "}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
              onClick={handleDialogValidate}
              color="primary"
              variant="contained"
              autoFocus
              disabled={isLoadingValidate}
              sx={{
                  minWidth: "160px",
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
              }}
          >
              {isLoadingValidate ? (
                  <CircularProgress
                      size={24}
                      color="inherit"
                  />
              ) : (
                  'Validate & Proceed'
              )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}