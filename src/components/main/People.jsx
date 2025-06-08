import '../../css/people.css';
import * as React from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    List,
    ListItem,
    ListItemText,
    Box,
} from '@mui/material';
import { useSelector } from 'react-redux';

import PersonCard from '../personCard';

const INFO_TEXT = (
  <div className="infoDialogContent">
    <Box className="infoSection steps">
      <Typography variant="h6" component="h4" gutterBottom>
        <span className="icon">⚙️</span> Steps to Add a Person:
      </Typography>
      <List dense className="infoList">
        <ListItem disablePadding>
          <ListItemText primary={<>First, click the <code>Start</code> button.</>} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary={<>You&apos;ll notice a button labeled &quot;<strong>Display Add buttons</strong>&quot; appear in your Instagram inbox.</>} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary={<>Click it and add people from Instagram.</>} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary={<>After adding people to <strong className="highlight-tool">Majembu</strong>, select &quot;<strong>Set up a message</strong>&quot;.</>} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary={<>There, add the user&apos;s information. They will be added, and <strong className="highlight-tool">Majembu</strong> will take care of the rest!</>} />
        </ListItem>
      </List>
    </Box>

    <Box className="infoSection important">
      <Typography variant="h6" component="h4" gutterBottom>
        <span className="icon">💡</span> Important:
      </Typography>
      <Typography variant="body1" component="p">
        The recipient <strong className="highlight-action">must reply</strong> to your initial message
        while you are <strong className="highlight-action">not actively in their chat</strong> on Instagram.
        This allows <strong className="highlight-tool">Majembu</strong> to detect the unread chat and send its automated reply.
      </Typography>
    </Box>

    <Box className="infoSection warning">
      <Typography variant="h6" component="h4" gutterBottom>
        <span className="icon">⚠️</span> Warning:
      </Typography>
      <Typography variant="body1" component="p">
        <strong className="highlight-tool">Majembu</strong> will <strong className="highlight-action" style={{ color: '#c0392b' }}>never</strong> reply to an old chat
        that does not have a notification icon (i.e., is not marked as unread).
      </Typography>
    </Box>
  </div>
);

export default function People() {
  const chats = useSelector(state => state.chats.chats);
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);

  const handleInfoClick = () => {
    setOpenInfoDialog(true);
  };

  const handleCloseInfoDialog = () => {
    setOpenInfoDialog(false);
  };

  return (
    <main className='people'>
      <ul className="people-list">
      {chats && chats.length > 0 ? (
        chats.map((chat) => (
          <PersonCard key={chat.id} person={chat} />
        ))
      ) : (
        <li className="empty-list-item">
          No People found.
        </li>
      )}
      </ul>

      <button
        className='add-person-info-button'
        onClick={handleInfoClick}
        title="How to add a person (Info)"
      >
        ?
      </button>

      <Dialog
        open={openInfoDialog}
        onClose={handleCloseInfoDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle
            id="alert-dialog-title"
            sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                pb: 1,
                borderBottom: '1px solid #eee'
            }}
        >
          How to Majembu
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important'}}>
          {INFO_TEXT}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button onClick={handleCloseInfoDialog} variant="contained" autoFocus>
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}