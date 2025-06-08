import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Box } from "@mui/material";

const DataRow = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      py: 0.45,
      width: "100%",
      lineHeight: 1.3,
    }}
  >
    <Typography
      component="span"
      sx={{
        fontSize: '0.7rem',
        minWidth: '95px',
        flexShrink: 0,
        color: 'text.primary',
        pr: 0.75,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}:
    </Typography>
    <Box
      component="span"
      sx={{
        flexGrow: 1,
        borderBottom: "1px dashed #dddd",
        mx: 0.75,
        minWidth: '10px',
      }}
    />
    <Typography
      component="span"
      sx={{
        fontWeight: "medium",
        textAlign: 'right',
        pl: 0.75,
        flexShrink: 0,
        minWidth: '35px',
        fontSize: '0.75rem',
      }}
    >
      {value}
    </Typography>
  </Box>
);

DataRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const ActionDisplay = ({ actionState, username, emotion }) => {
  let message = null;
  let textSx = {
    fontSize: '0.75rem',
    textAlign: 'center',
    mt: 0.5,
    minHeight: '1.2em',
    fontStyle: 'italic',
    color: 'text.secondary',
  };

  switch (actionState) {
    case 'generating':
      message = `Generating message for ${username || 'user'}...`;
      break;
    case 'notice':
      message = `Notice: ${username || 'User'} is extremely ${emotion || 'emotional'}!`;
      textSx = {
        ...textSx,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: 'warning.main',
      };
      break;
    case 'none':
    default:
      message = "No actions now";
      textSx = {
        ...textSx,
        fontStyle: 'normal',
      };
      break;
  }

  const floatKeyframes = {
    '0%': {
      transform: 'translateY(0px)',
    },
    '100%': {
      transform: 'translateY(-2.5px)',
    },
  };

  const animationSx =
    actionState === 'generating' || actionState === 'notice'
      ? {
          '@keyframes gentleFloat': floatKeyframes,
          animation: 'gentleFloat 3s ease-in-out infinite alternate',
        }
      : {};

  return (
    <Typography
      component="div"
      sx={{
        ...textSx,
        ...animationSx,
      }}
    >
      {message}
    </Typography>
  );
};

ActionDisplay.propTypes = {
  actionState: PropTypes.oneOf(['generating', 'none', 'notice']).isRequired,
  username: PropTypes.string,
  emotion: PropTypes.string,
};

ActionDisplay.defaultProps = {
  username: '',
  emotion: '',
};

export default function StatusCard({ status }) {
  const {
    platform,
    currentPeople,
    totalChats,
    actionDetails,
  } = status;

  return (
    <Card sx={{
      width: 200,
      minWidth: 200,
      p: 1,
      boxSizing: 'border-box',
      boxShadow: 3,
    }}>
      <CardContent sx={{ p: '8px !important', '&:last-child': { pb: '8px !important' } }}>
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          sx={{
            textAlign: 'center',
            mb: 1.5,
            fontWeight: 'bold',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {platform === "instagram" ?
            <span className="instagram-link">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            :
            <>{platform.charAt(0).toUpperCase() + platform.slice(1)}</>
          }
        </Typography>

        <DataRow label="Current People" value={currentPeople} />
        <DataRow label="Total Chats" value={totalChats} />

        <Typography
          variant="subtitle2"
          component="div"
          sx={{
            mt: 1.5,
            mb: 0.25,
            fontWeight: 'bold',
            fontSize: '0.8rem',
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          Current Action
        </Typography>

        {actionDetails && (
          <ActionDisplay
            actionState={actionDetails.state}
            username={actionDetails.username}
            emotion={actionDetails.emotion}
          />
        )}
        {!actionDetails && (
            <ActionDisplay actionState="none" />
        )}

      </CardContent>
    </Card>
  );
}

StatusCard.propTypes = {
  status: PropTypes.shape({
    platform: PropTypes.string.isRequired,
    currentPeople: PropTypes.number.isRequired,
    totalChats: PropTypes.number.isRequired,
    actionDetails: PropTypes.shape({
      state: PropTypes.oneOf(['generating', 'none', 'notice']).isRequired,
      username: PropTypes.string,
      emotion: PropTypes.string,
    }),
  }).isRequired,
};