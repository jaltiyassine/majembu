import * as React from 'react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { useDispatch } from 'react-redux';
import { setInfo } from '../../features/userSlice';
import { setTabIndex } from '../../features/boolsSlice';
import { addNotif } from '../../features/notificationsSlice';

const MAX_USER_NAME_LENGTH = 64;
const MAX_USER_AGE_LENGTH = 3;
const MAX_USER_GENDER_LENGTH = 30;
const MAX_USER_DESCRIPTION_LENGTH = 1024;

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    otherGender: '',
    description: '',
  });

  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};

    if (!formData.name) {
      tempErrors.name = 'Name is required.';
    } else if (formData.name.length > MAX_USER_NAME_LENGTH) {
      tempErrors.name = `Name cannot exceed ${MAX_USER_NAME_LENGTH} characters.`;
    } else {
      tempErrors.name = '';
    }

    if (!formData.age) {
      tempErrors.age = 'Age is required.';
    } else if (isNaN(formData.age) || Number(formData.age) <= 0) {
      tempErrors.age = 'Age must be a positive number.';
    } else if (String(formData.age).length > MAX_USER_AGE_LENGTH) {
      tempErrors.age = `Age cannot exceed ${MAX_USER_AGE_LENGTH} digits.`;
    } else {
      tempErrors.age = '';
    }

    if (!formData.gender) {
      tempErrors.gender = 'Gender is required.';
    } else if (formData.gender !== 'Other' && formData.gender.length > MAX_USER_GENDER_LENGTH) {
      tempErrors.gender = `Gender value cannot exceed ${MAX_USER_GENDER_LENGTH} characters.`;
    } else {
      tempErrors.gender = '';
    }

    if (formData.gender === 'Other') {
      if (!formData.otherGender) {
        tempErrors.otherGender = 'Please specify your gender.';
      } else if (formData.otherGender.length > MAX_USER_GENDER_LENGTH) {
        tempErrors.otherGender = `Specified gender cannot exceed ${MAX_USER_GENDER_LENGTH} characters.`;
      } else {
        tempErrors.otherGender = '';
      }
    } else {
      tempErrors.otherGender = '';
    }

    if (!formData.description) {
      tempErrors.description = 'Description is required.';
    } else if (formData.description.length > MAX_USER_DESCRIPTION_LENGTH) {
      tempErrors.description = `Description cannot exceed ${MAX_USER_DESCRIPTION_LENGTH} characters.`;
    } else {
      tempErrors.description = '';
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'gender' && value !== 'Other' && { otherGender: '' }),
    }));

    if (name === 'gender') {
      if (value !== 'Other') {
        setErrors((prev) => ({ ...prev, gender: '', otherGender: '' }));
      } else {
        setErrors((prev) => ({ ...prev, gender: ''}));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      setIsLoading(true);
      const finalGender = formData.gender === 'Other' ? formData.otherGender : formData.gender;

      const registrationData = {
        name: formData.name,
        age: Number(formData.age),
        gender: finalGender,
        description: formData.description,
        isSet: true,
        API_KEY: null
      };

      const apiUrl = 'https://gen-hub.fun/register.php';
      const requestBody = {
        user: registrationData,
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

          if (responseData && responseData.API_KEY) {
            registrationData.API_KEY = responseData.API_KEY;

            dispatch(setInfo(registrationData));
            dispatch(setTabIndex(0));
          } else {
            dispatch(addNotif({
                id: Math.floor(100000 + Math.random() * 900000),
                severity: "error",
                message: responseData.message || "Registration failed. API Key not received.",
                dateToShow: 1,
              }));
            const html = document.documentElement;
            html.scrollTop = 0;
          }
        } else {
            const errorData = await response.json().catch(() => ({ message: "Registration failed. Server error." }));
            dispatch(addNotif({
                id: Math.floor(100000 + Math.random() * 900000),
                severity: "error",
                message: errorData.message || `Registration failed. Status: ${response.status}`,
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
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
        variant="h5"
        component="h1"
        sx={{
          textAlign: 'center',
          fontWeight: 'medium',
          color: 'primary.main',
          mb: 1,
        }}
      >
        Register Your Profile
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          mb: 3,
        }}
      >
      This information is used to personalize the AI model responses.
      </Typography>

      <TextField
        required
        id="name"
        name="name"
        label="Your Name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        error={!!errors.name}
        helperText={errors.name || ' '}
        inputProps={{ maxLength: MAX_USER_NAME_LENGTH }}
        disabled={isLoading}
      />

      <TextField
        required
        id="age"
        name="age"
        label="Your Age"
        type="number"
        value={formData.age}
        onChange={handleChange}
        fullWidth
        InputProps={{
          inputProps: {
            min: 1,
          },
        }}
        error={!!errors.age}
        helperText={errors.age || ' '}
        disabled={isLoading}
      />

      <FormControl fullWidth required error={!!errors.gender || (formData.gender === 'Other' && !!errors.otherGender)} disabled={isLoading}>
        <InputLabel id="gender-label">Gender</InputLabel>
        <Select
          labelId="gender-label"
          id="gender"
          name="gender"
          value={formData.gender}
          label="Gender"
          onChange={handleChange}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
          <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
        </Select>
        {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        {!errors.gender && formData.gender !== 'Other' && <FormHelperText> </FormHelperText>}
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
          error={!!errors.otherGender}
          helperText={errors.otherGender || ' '}
          inputProps={{ maxLength: MAX_USER_GENDER_LENGTH }}
          sx={{ mt: formData.gender === 'Other' && !errors.gender ? -0.5 : 0 }}
          disabled={isLoading}
        />
      )}

      <TextField
        required
        id="description"
        name="description"
        label="Description About Yourself"
        placeholder="The more specific you are, the better the AI can mimic you"
        multiline
        rows={4}
        value={formData.description}
        onChange={handleChange}
        fullWidth
        error={!!errors.description}
        helperText={errors.description || ' '}
        inputProps={{ maxLength: MAX_USER_DESCRIPTION_LENGTH }}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>
    </Box>
  );
}