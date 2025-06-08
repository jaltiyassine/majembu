import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addConfigMessage } from '../../features/messagesSlice';
import { setTabIndex } from '../../features/boolsSlice';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import uniqid from '../../utils/uniqid';

const MAX_PERSON_REALNAME_LENGTH = 64;
const MAX_PERSON_AGE_LENGTH = 3;
const MAX_PERSON_GENDER_LENGTH = 30;
const MAX_PERSON_DESCRIPTION_LENGTH = 1024;
const MAX_RELATIONSHIP_LENGTH = 256;
const MAX_CURRENTGOAL_LENGTH = 256;

const sliderMarks = [
  { value: 1, label: '1s' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 45, label: '45s' },
  { value: 60, label: '1min' },
];

function valuetext(value) {
  return `${value}s`;
}

export default function SetUpMessage() {
  let tab = useSelector(state => state.bools.tab);
  let person = tab.param;
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    otherGender: '',
    introduction: '',
    relationship: '',
    customRelationship: '',
    currentGoal: '',
    customGoal: '',
    replyDelaySeconds: 1,
  });

  const [errors, setErrors] = useState({});
  const [showCustomRelationship, setShowCustomRelationship] = useState(false);
  const [showCustomGoal, setShowCustomGoal] = useState(false);

  useEffect(() => {
    setShowCustomRelationship(formData.relationship === 'custom');
    if (formData.relationship !== 'custom') {
      setFormData(prev => ({ ...prev, customRelationship: '' }));
      setErrors(prev => ({...prev, customRelationship: undefined }));
    }
  }, [formData.relationship]);

  useEffect(() => {
    setShowCustomGoal(formData.currentGoal === 'custom');
    if (formData.currentGoal !== 'custom') {
      setFormData(prev => ({ ...prev, customGoal: '' }));
      setErrors(prev => ({...prev, customGoal: undefined }));
    }
  }, [formData.currentGoal]);

  useEffect(() => {
    if (formData.gender !== 'Other') {
      setFormData(prev => ({ ...prev, otherGender: '' }));
      setErrors(prev => ({...prev, otherGender: undefined }));
    }
  }, [formData.gender]);


  const validate = () => {
    let tempErrors = {};

    tempErrors.name = "";
    if (formData.name && formData.name.length > MAX_PERSON_REALNAME_LENGTH) {
        tempErrors.name = `Name cannot exceed ${MAX_PERSON_REALNAME_LENGTH} characters.`;
    }

    tempErrors.age = "";
    if (formData.age) {
        if (isNaN(formData.age) || Number(formData.age) <= 0) {
            tempErrors.age = "Age must be a positive number.";
        } else if (String(formData.age).length > MAX_PERSON_AGE_LENGTH) {
            tempErrors.age = `Age cannot exceed ${MAX_PERSON_AGE_LENGTH} digits.`;
        }
    }

    tempErrors.gender = "";
    if (formData.gender && formData.gender !== 'Other' && formData.gender.length > MAX_PERSON_GENDER_LENGTH) {
        tempErrors.gender = `Gender value cannot exceed ${MAX_PERSON_GENDER_LENGTH} characters.`;
    }

    tempErrors.otherGender = "";
    if (formData.gender === 'Other') {
        if (!formData.otherGender) {
            tempErrors.otherGender = "Please specify gender.";
        } else if (formData.otherGender.length > MAX_PERSON_GENDER_LENGTH) {
            tempErrors.otherGender = `Specified gender cannot exceed ${MAX_PERSON_GENDER_LENGTH} characters.`;
        }
    }

    if (!formData.introduction) {
        tempErrors.introduction = "Introduction is required.";
    } else if (formData.introduction.length > MAX_PERSON_DESCRIPTION_LENGTH) {
        tempErrors.introduction = `Introduction cannot exceed ${MAX_PERSON_DESCRIPTION_LENGTH} characters.`;
    } else {
        tempErrors.introduction = "";
    }

    if (!formData.relationship) {
        tempErrors.relationship = "Relationship is required.";
    } else if (formData.relationship !== 'custom' && formData.relationship.length > MAX_RELATIONSHIP_LENGTH) {
         tempErrors.relationship = `Relationship value cannot exceed ${MAX_RELATIONSHIP_LENGTH} characters.`;
    } else {
        tempErrors.relationship = "";
    }

    tempErrors.customRelationship = "";
    if (formData.relationship === 'custom') {
      if (!formData.customRelationship) {
        tempErrors.customRelationship = "Custom relationship description is required.";
      } else if (formData.customRelationship.length > MAX_RELATIONSHIP_LENGTH) {
        tempErrors.customRelationship = `Custom relationship cannot exceed ${MAX_RELATIONSHIP_LENGTH} characters.`;
      }
    }

    if (!formData.currentGoal) {
        tempErrors.currentGoal = "Current goal is required.";
    } else if (formData.currentGoal !== 'custom' && formData.currentGoal.length > MAX_CURRENTGOAL_LENGTH) {
        tempErrors.currentGoal = `Goal value cannot exceed ${MAX_CURRENTGOAL_LENGTH} characters.`;
    } else {
        tempErrors.currentGoal = "";
    }

    tempErrors.customGoal = "";
     if (formData.currentGoal === 'custom') {
        if (!formData.customGoal) {
            tempErrors.customGoal = "Custom goal description is required.";
        } else if (formData.customGoal.length > MAX_CURRENTGOAL_LENGTH) {
            tempErrors.customGoal = `Custom goal cannot exceed ${MAX_CURRENTGOAL_LENGTH} characters.`;
        }
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every(x => x === "" || x === undefined);
  };


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    if (errors[name]) {
       setErrors(prev => ({...prev, [name]: undefined }));
    }
    if (name === 'gender' && errors.gender) {
        setErrors(prev => ({...prev, gender: undefined}));
    }
    if (name === 'otherGender' && errors.otherGender) {
      setErrors(prev => ({...prev, otherGender: undefined }));
    }
    if (name === 'customRelationship' && errors.customRelationship) {
      setErrors(prev => ({...prev, customRelationship: undefined }));
    }
    if (name === 'customGoal' && errors.customGoal) {
      setErrors(prev => ({...prev, customGoal: undefined }));
    }
  };

  const handleSliderChange = (event, newValue) => {
    setFormData(prevState => ({
      ...prevState,
      replyDelaySeconds: newValue,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      const newMessageConfig = {
        id: uniqid(),
        person: {
            id: person.id,
            display_name: person.display_name,
            realname: formData.name || 555,
            pp_url: person.pp_url,
            age: formData.age ? Number(formData.age) : 555,
            gender: formData.gender === '' ? 555 : (formData.gender === 'Other' ? formData.otherGender : formData.gender),
            description: formData.introduction
        },
        relationship: (formData.relationship === "custom")? formData.customRelationship : formData.relationship,
        currentGoal:  (formData.currentGoal === "custom")? formData.customGoal : formData.currentGoal,
        emotions: { happiness: 0, anger: 0, sadness: 0 },
        score: { satisfaction: 0, love: 0, comfort: 0 },
        replyDelaySeconds: formData.replyDelaySeconds,
        lastSeen: Date.now(),
        conversation: []
      }
      dispatch(addConfigMessage(newMessageConfig));
      dispatch(setTabIndex(2));
    } else {
        console.log("Validation Failed", errors)
    }
  };

  return (
    <main className='setupmessage'>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          margin: 'auto',
          padding: 3,
          maxWidth: 500,
        }}
        noValidate
        autoComplete="off"
      >
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 'medium',
          color: 'primary.dark',
          mb:1
        }}
      >
        Conversation Setup With <span style={{color: "#333"}}>{person.display_name}</span>
      </Typography>
      <TextField
        id="name"
        name="name"
        label="Person's Name (Optional)"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        error={!!(errors.name && errors.name !== "")}
        helperText={(errors.name && errors.name !== "") ? errors.name : "Optional. Defaults if left empty."}
        inputProps={{ maxLength: MAX_PERSON_REALNAME_LENGTH }}
      />

      <TextField
        id="age"
        name="age"
        label="Person's Age (Optional)"
        type="number"
        value={formData.age}
        onChange={handleChange}
        fullWidth
        InputProps={{
            inputProps: { min: 1 }
        }}
        error={!!(errors.age && errors.age !== "")}
        helperText={(errors.age && errors.age !== "") ? errors.age : "Optional. Defaults if left empty."}
      />

      <FormControl fullWidth error={!!(errors.gender && errors.gender !== "") || (formData.gender === 'Other' && !!(errors.otherGender && errors.otherGender !== ""))}>
        <InputLabel id="gender-label">Gender (Optional)</InputLabel>
        <Select
          labelId="gender-label"
          id="gender"
          name="gender"
          value={formData.gender}
          label="Gender (Optional)"
          onChange={handleChange}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
          <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
        </Select>
        <FormHelperText>
            {(errors.gender && errors.gender !== "") ? errors.gender :
             (formData.gender === 'Other' && errors.otherGender && errors.otherGender !== "") ? errors.otherGender :
             "Optional. Defaults if left empty."}
        </FormHelperText>
      </FormControl>

      {formData.gender === 'Other' && (
        <TextField
          required
          id="other-gender"
          name="otherGender"
          label="Please Specify Gender"
          value={formData.otherGender}
          onChange={handleChange}
          fullWidth
          error={!!(errors.otherGender && errors.otherGender !== "")}
          helperText={(errors.otherGender && errors.otherGender !== "") ? errors.otherGender : ' '}
          inputProps={{ maxLength: MAX_PERSON_GENDER_LENGTH }}
          sx={{ mt: (formData.gender === 'Other' && !(errors.gender && errors.gender !== "")) ? -0.5 : 0 }}
        />
      )}

      <TextField
        required
        id="introduction"
        name="introduction"
        label="Brief Introduction"
        placeholder="Describe that person in a few lines..."
        multiline
        rows={4}
        value={formData.introduction}
        onChange={handleChange}
        fullWidth
        error={!!errors.introduction}
        helperText={errors.introduction || ' '}
        inputProps={{ maxLength: MAX_PERSON_DESCRIPTION_LENGTH }}
      />

      <FormControl fullWidth required error={!!errors.relationship || (formData.relationship === 'custom' && !!errors.customRelationship)}>
        <InputLabel id="relationship-label">Current Relationship With {person.display_name}</InputLabel>
        <Select
          labelId="relationship-label"
          id="relationship"
          name="relationship"
          value={formData.relationship}
          label={"Current Relationship With "+person.display_name}
          onChange={handleChange}
        >
          <MenuItem value="Romantic">Romantic</MenuItem>
          <MenuItem value="Friendship">Friendship</MenuItem>
          <MenuItem value="Strangers">Strangers</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
        {errors.relationship && <FormHelperText>{errors.relationship}</FormHelperText>}
        {!errors.relationship && !(formData.relationship === 'custom') && <FormHelperText> </FormHelperText>}
      </FormControl>

      {showCustomRelationship && (
        <TextField
          required
          id="customRelationship"
          name="customRelationship"
          label="Specify Custom Relationship"
          value={formData.customRelationship}
          onChange={handleChange}
          fullWidth
          error={!!errors.customRelationship}
          helperText={errors.customRelationship || ' '}
          inputProps={{ maxLength: MAX_RELATIONSHIP_LENGTH }}
          sx={{ mt: (formData.relationship === 'custom' && !errors.relationship) ? -0.5 : 0 }}
        />
      )}

      <FormControl fullWidth required error={!!errors.currentGoal || (formData.currentGoal === 'custom' && !!errors.customGoal)}>
        <InputLabel id="currentGoal-label">Current Goal</InputLabel>
        <Select
          labelId="currentGoal-label"
          id="currentGoal"
          name="currentGoal"
          value={formData.currentGoal}
          label="Current Goal"
          onChange={handleChange}
        >
          <MenuItem value="get her">Get Her To Like You</MenuItem>
          <MenuItem value="get him">Get Him To Like You</MenuItem>
          <MenuItem value="just casual talking">Just Casual Talking</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
        {errors.currentGoal && <FormHelperText>{errors.currentGoal}</FormHelperText>}
        {!errors.currentGoal && !(formData.currentGoal === 'custom') && <FormHelperText> </FormHelperText>}
      </FormControl>

        {showCustomGoal && (
        <TextField
          required
          id="customGoal"
          name="customGoal"
          label="Specify Custom Goal"
          value={formData.customGoal}
          onChange={handleChange}
          fullWidth
          error={!!errors.customGoal}
          helperText={errors.customGoal || ' '}
          inputProps={{ maxLength: MAX_CURRENTGOAL_LENGTH }}
          sx={{ mt: (formData.currentGoal === 'custom' && !errors.currentGoal) ? -0.5 : 0 }}
        />
      )}

      <Box sx={{ width: '95%', margin: 'auto', pt: 2 }}>
        <Typography id="reply-delay-slider-label" gutterBottom>
          Reply Delay (seconds): {formData.replyDelaySeconds}s
        </Typography>
        <Slider
          aria-labelledby="reply-delay-slider-label"
          name="replyDelaySeconds"
          value={formData.replyDelaySeconds}
          onChange={handleSliderChange}
          getAriaValueText={valuetext}
          valueLabelDisplay="auto"
          step={1}
          marks={sliderMarks}
          min={1}
          max={60}
        />
      </Box>

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Save Setup
      </Button>
    </Box>
    </main>
  );
}