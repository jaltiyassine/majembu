import * as React from 'react';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useSelector } from 'react-redux';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default function Notification() {
  let notifications = useSelector(state => state.notifications.notifications);

  const expiredNotifs = React.useMemo(() =>
    notifications.filter(notif => Date.now() > notif.dateToShow),
    [notifications]
  );

  return (
    <IconButton aria-label="cart">
      <StyledBadge badgeContent={(expiredNotifs.length <= 0 )? 0 : expiredNotifs.length - 1} color="secondary">
        <NotificationsIcon  sx={{ color: 'white' }}/>
      </StyledBadge>
    </IconButton>
  );
}