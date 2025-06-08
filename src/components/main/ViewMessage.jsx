import * as React from 'react';
import {
    Container,
    Paper,
    Grid,
    Button,
    Avatar,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    DialogContentText,
    FormHelperText,
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import {
    PeopleAltOutlined,
    TrackChangesOutlined,
    TimerOutlined,
} from '@mui/icons-material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CircularProgress from '@mui/material/CircularProgress';

import { removeConfigMessage } from '../../features/messagesSlice';
import { setTabIndex, setShiftSubject, deleteShiftSubject } from '../../features/boolsSlice';
import { addNotif } from '../../features/notificationsSlice';

const MAX_SHIFTSUBJECT_LENGTH = 100;

const formatTimestamp = (timestamp, options = {}) => {
    const { isMillis = false, format = 'toLocaleString' } = options;
    if (timestamp === null || timestamp === undefined || timestamp === '') return 'N/A';

    try {
        const numericTimestamp = Number(timestamp);
        if (isNaN(numericTimestamp)) {
            throw new Error('Timestamp is not a valid number');
        }
        const date = new Date(isMillis ? numericTimestamp : numericTimestamp * 1000);
        if (isNaN(date.getTime())) {
             throw new Error('Invalid Date object created');
        }
        switch(format) {
            case 'toLocaleString': return date.toLocaleString();
            case 'toLocaleDateString': return date.toLocaleDateString();
            case 'toLocaleTimeString': return date.toLocaleTimeString();
            default: return date.toLocaleString();
        }
    } catch (e) {
        console.error("Error formatting timestamp:", timestamp, e);
        return 'Invalid Date';
    }
};

const formatPercentage = (value) => {
     if (value === null || value === undefined || isNaN(Number(value))) {
        return 'N/A';
    }
    return `${Number(value).toFixed(0)}%`;
};


const DetailSection = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '1.1rem',
    textAlign: 'left',
    width: '100%'
}));

const ConversationListItem = styled(ListItem)(({ theme, messagesource }) => ({
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: messagesource === 'from'
        ? theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800]
        : 'transparent',
    alignItems: 'flex-start',
    textAlign: 'left',
    border: messagesource === 'from'? "" : `solid 1px ${theme.palette.divider}`
}));

const DetailBadge = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.8, 1.2),
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: alpha(theme.palette.action.selected, 0.08),
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
}));


export default function ViewMessage() {
    const theme = useTheme();
    let tab = useSelector(state => state.bools.tab);
    let data = tab?.param;
    let allMessages = useSelector(state => state.configMessages.configMessages);
    const selfMessage = allMessages.find(msg => msg.id === data?.id);

    const dispatch = useDispatch();

    const [openShiftDialog, setOpenShiftDialog] = React.useState(false);
    const [selectedSubject, setSelectedSubject] = React.useState('');
    const [customSubject, setCustomSubject] = React.useState('');
    const [customSubjectError, setCustomSubjectError] = React.useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const predefinedSubjects = ['What scares you most?',
                                'Let\'s go on a real date, no games.',
                                'What\'s your favorite movie?',
                                'Truth or dare, let\'s make it fun.'
                            ];

    if (!data || !data.person || !selfMessage) {
        return (
            <Container maxWidth="md">
                <Paper sx={{ padding: 3, textAlign: 'center', boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" color="text.secondary">Loading details or configuration not found...</Typography>
                </Paper>
            </Container>
        );
    }

    const {
        id,
        person,
        relationship,
        currentGoal,
        emotions,
        score,
        replyDelaySeconds,
        conversation
    } = selfMessage;

    let shiftSubjects = useSelector(state => state.bools.shiftSubjects);
    let shiftSubject = shiftSubjects.find((sbj) => sbj.conversationID === id);
    let disableShiftButton = shiftSubject ? shiftSubject.disableShiftButton : false;
    const currentUser = useSelector((state) => state.user.info);

    const handleModify = () => {
        dispatch(setTabIndex(5));
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);

        const apiUrl = 'https://gen-hub.fun/delete_conv.php';
        const requestBody = {
            person_id_json: person.id,
            API_KEY: currentUser.API_KEY
        }
    
        try {
            const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
            const responseData = await response.json();
    
            if (responseData && responseData.message) {  
                setIsLoading(false);
                    
                setOpenDeleteDialog(false);
                dispatch(removeConfigMessage(id));
                dispatch(deleteShiftSubject(id));
                dispatch(setTabIndex(2));

                dispatch(addNotif({
                id: Math.floor(100000 + Math.random() * 900000),
                severity: "success",
                message: responseData.message || "Updated successfully!",
                dateToShow: 1,
                }));

                const html = document.documentElement;
                html.scrollTop = 0;
            } else {
                dispatch(addNotif({
                    id: Math.floor(100000 + Math.random() * 900000),
                    severity: "error",
                    message: responseData.message || "failed.",
                    dateToShow: 1,
                }));
                const html = document.documentElement;
                html.scrollTop = 0;
            }
            } else {
                const errorData = await response.json().catch(() => ({ message: "Failed. Server error." }));
                dispatch(addNotif({
                    id: Math.floor(100000 + Math.random() * 900000),
                    severity: "error",
                    message: errorData.message || `Failed. Status: ${response.status}`,
                    dateToShow: 1,
                }));
                const html = document.documentElement;
                html.scrollTop = 0;
            }
    
        } catch (error) {
            dispatch(addNotif({
            id: Math.floor(100000 + Math.random() * 900000),
            severity: "error",
            message: "Something Went wrong! Please check your connection.",
            dateToShow: 1,
            }));
    
            const html = document.documentElement;
            html.scrollTop = 0;
        }
    };

    const handleShiftSubject = () => {
        setSelectedSubject('custom');
        setCustomSubject('');
        setCustomSubjectError('');
        setOpenShiftDialog(true);
    };

    const handleCloseShiftDialog = () => {
        setOpenShiftDialog(false);
        setCustomSubjectError('');
    };

    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
        if (event.target.value !== 'custom') {
            setCustomSubjectError('');
        }
    };

    const handleCustomSubjectChange = (event) => {
        const value = event.target.value;
        setCustomSubject(value);
        if (value.trim() && customSubjectError) {
            setCustomSubjectError('');
        }
        if (value.length > MAX_SHIFTSUBJECT_LENGTH) {
            setCustomSubjectError(`Subject cannot exceed ${MAX_SHIFTSUBJECT_LENGTH} characters.`);
        } else if (!value.trim() && selectedSubject === 'custom') {
            setCustomSubjectError('Custom subject cannot be empty.');
        } else {
            setCustomSubjectError('');
        }
    };

    const validateShiftSubject = () => {
        if (selectedSubject === 'custom') {
            if (!customSubject.trim()) {
                setCustomSubjectError('Custom subject cannot be empty.');
                return false;
            }
            if (customSubject.length > MAX_SHIFTSUBJECT_LENGTH) {
                setCustomSubjectError(`Subject cannot exceed ${MAX_SHIFTSUBJECT_LENGTH} characters.`);
                return false;
            }
        }
        setCustomSubjectError('');
        return true;
    };

    const handleConfirmShiftSubject = () => {
        if (!validateShiftSubject()) {
            return;
        }
        const finalSubject = selectedSubject === 'custom' ? customSubject.trim() : selectedSubject;
        dispatch(setShiftSubject({
            conversationID: id,
            subject: finalSubject,
            disableShiftButton: true,
          }));
        handleCloseShiftDialog();
    };

    const displayAge = person.age === 555 || person.age == null || person.age === '' ? 'Not specified' : person.age;
    const displayGender = person.gender === 555 || person.gender == null || person.gender === '' ? 'Not specified' : person.gender;
    const avatarAlt = person.display_name || (person.realname && person.realname !== 555 ? person.realname : '') || 'User';


    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <DetailSection variant="outlined">
                    <Grid container spacing={3}>

                        <Grid item xs={12} md={3} sx={{ display: 'flex', margin: 'auto', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <Avatar
                                alt={avatarAlt}
                                src={person.pp_url}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mb: 2,
                                    border: `3px solid ${theme.palette.primary.main}`
                                }}
                            />
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                {person.display_name}
                            </Typography>
                            {person.realname && person.realname !== 555 && person.realname !== person.display_name && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    ({person.realname})
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Age: {displayAge}
                            </Typography>
                             <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Gender: {displayGender}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 2, fontStyle: 'italic', wordBreak: 'break-word' }}>
                                {person.description || 'No description available.'}
                            </Typography>
                            <Chip label={`ID: ${person.id}`} size="small" variant="outlined" sx={{ mt: 'auto' }} />
                        </Grid>

                        <Grid item xs={12} md={9}>
                        <SectionTitle variant="h6">Details</SectionTitle>
                        <Grid container spacing={1.5}>

                            <Grid item xs={12}>
                                <DetailBadge>
                                    <PeopleAltOutlined color="primary" fontSize="small" />
                                    <Typography variant="body2" component="span" sx={{ flexGrow: 1 }}>
                                        <strong>Relationship:</strong> {relationship || 'N/A'}
                                    </Typography>
                                </DetailBadge>
                            </Grid>

                            <Grid item xs={12}>
                                <DetailBadge>
                                    <TrackChangesOutlined color="secondary" fontSize="small" />
                                    <Typography variant="body2" component="span" sx={{ flexGrow: 1 }}>
                                        <strong>Goal:</strong> {currentGoal || 'N/A'}
                                    </Typography>
                                </DetailBadge>
                            </Grid>

                            <Grid item xs={12}>
                                <DetailBadge>
                                    <TimerOutlined color="warning" fontSize="small" />
                                    <Typography variant="body2" component="span" sx={{ flexGrow: 1 }}>
                                        <strong>Avg. Reply Delay:</strong> {replyDelaySeconds ? `${replyDelaySeconds}s` : 'N/A'}
                                    </Typography>
                                </DetailBadge>
                            </Grid>

                        </Grid>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                        <Grid item xs={12} md={6} sx={{ textAlign: 'left', width: '100%' }}>
                            <SectionTitle variant="subtitle1">Emotions</SectionTitle>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" component="span">Happiness</Typography>
                                        <Chip label={formatPercentage(emotions?.happiness)} color="success" size="small" variant="outlined" />
                                    </Box>
                                    <LinearProgress variant="determinate" value={emotions?.happiness ?? 0} color="success" sx={{ height: 8, borderRadius: 4 }}/>
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" component="span">Anger</Typography>
                                        <Chip label={formatPercentage(emotions?.anger)} color="error" size="small" variant="outlined" />
                                    </Box>
                                    <LinearProgress variant="determinate" value={emotions?.anger ?? 0} color="error" sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" component="span">Sadness</Typography>
                                        <Chip label={formatPercentage(emotions?.sadness)} color="info" size="small" variant="outlined" />
                                    </Box>
                                    <LinearProgress variant="determinate" value={emotions?.sadness ?? 0} color="info" sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ textAlign: 'left', width: '100%' }}>
                            <SectionTitle variant="subtitle1">Scores</SectionTitle>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" component="span">Satisfaction</Typography>
                                        <Chip label={formatPercentage(score?.satisfaction)} color="primary" size="small" variant="outlined" />
                                    </Box>
                                    <LinearProgress variant="determinate" value={score?.satisfaction ?? 0} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" component="span">Love</Typography>
                                        <Chip label={formatPercentage(score?.love)} color="secondary" size="small" variant="outlined" />
                                    </Box>
                                    <LinearProgress variant="determinate" value={score?.love ?? 0} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" component="span">Comfort</Typography>
                                        <Chip label={formatPercentage(score?.comfort)} color="warning" size="small" variant="outlined" />
                                    </Box>
                                    <LinearProgress variant="determinate" value={score?.comfort ?? 0} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                                </Box>
                            </Box>
                        </Grid>

                         <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                        <Grid item xs={12} sx={{ textAlign: 'left', width: '100%' }}>
                            <SectionTitle variant="subtitle1">Actions</SectionTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={handleModify}
                                >
                                Modify
                                </Button>

                                <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                                >
                                Delete
                                </Button>

                                <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                startIcon={<SwapHorizIcon />}
                                onClick={handleShiftSubject}
                                disabled={disableShiftButton}
                                >{disableShiftButton? "Shifting Subject..." : "Shift Subject"}</Button>
                            </Box>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                        <Grid item xs={12} sx={{ textAlign: 'left', width: '100%' }}>
                            <SectionTitle variant="h6">
                                Conversation History ({conversation?.length || 0})
                            </SectionTitle>
                            {conversation && conversation.length > 0 ? (
                                <Box sx={{ maxHeight: '450px', overflowY: 'auto', pr: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius, padding: theme.spacing(1) }}>
                                    <List disablePadding>
                                        {[...conversation].reverse().map((message, index) => (
                                            <ConversationListItem
                                                key={`${message.timestamp}-${index}-${message.source}`}
                                                messagesource={message.source}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1" sx={{ wordBreak: 'break-word', fontSize: '0.86rem', marginBottom: '10px' }}>
                                                            {message.content}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography sx={{ display: 'inline', fontWeight: 'medium' }} component="span" variant="body2" color="text.primary">
                                                                {message.source === 'from' ? person.display_name : 'You'}
                                                            </Typography>
                                                            <Typography component="span" variant="caption" color="text.secondary">
                                                            {` — ${formatTimestamp(message.timestamp)}`}
                                                            </Typography>
                                                            {message.interpretations?.generalDescription && (
                                                                <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', mt: 0.5, color: 'text.secondary' }}>
                                                                    Interpretation: {message.interpretations.generalDescription}
                                                                </Typography>
                                                            )}
                                                        </>
                                                    }
                                                />
                                            </ConversationListItem>
                                        ))}
                                    </List>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    No conversation history available.
                                </Typography>
                            )}
                        </Grid>

                    </Grid>
                </DetailSection>
            </Container>

            <Dialog open={openShiftDialog} onClose={handleCloseShiftDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Shift Conversation Subject</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset" sx={{ width: '100%' }} error={selectedSubject === 'custom' && !!customSubjectError}>
                        <FormLabel component="legend" sx={{ mb: 1 }}>Select a new subject or enter a custom one:</FormLabel>
                        <RadioGroup
                            aria-label="subject"
                            name="subject-radio-group"
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                        >
                            {predefinedSubjects.map((subject) => (
                                <FormControlLabel key={subject} value={subject} control={<Radio size="small"/>} label={subject} />
                            ))}
                            <FormControlLabel value="custom" control={<Radio size="small"/>} label="Custom" />
                        </RadioGroup>
                        {selectedSubject === 'custom' && (
                            <>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="custom-subject"
                                    label="Custom Subject"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                    value={customSubject}
                                    onChange={handleCustomSubjectChange}
                                    required
                                    error={!!customSubjectError}
                                    inputProps={{ maxLength: MAX_SHIFTSUBJECT_LENGTH }}
                                    sx={{ mt: 1 }}
                                />
                                {customSubjectError && <FormHelperText>{customSubjectError}</FormHelperText>}
                            </>
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseShiftDialog}>Cancel</Button>
                    <Button
                        onClick={handleConfirmShiftSubject}
                        disabled={(selectedSubject === 'custom' && (!customSubject.trim() || !!customSubjectError))}
                        variant="contained"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this conversation and all related data with <span style={{fontWeight: "bold"}}>{person.display_name}</span>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        autoFocus
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress
                                size={24}
                                color="inherit"
                            />
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}