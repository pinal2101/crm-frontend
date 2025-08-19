'use client';
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const drawerWidth = 400;

export default function AddLeadDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    websiteURL: '',
    linkdinURL: '',
    whatsUpNumber: '',
    status: '',
    workEmail: '',
    userId: '',
    priority: '',
  });
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/leads', formData);
      console.log('Lead created:', res.data);
      onClose(); // close the drawer after submission
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: drawerWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h6" noWrap>
            Add New Lead
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form Content */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="email"
          />
          <TextField
            label="Work Email"
            name="workEmail"
            value={formData.workEmail}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="email"
          />
          <TextField
            label="Website URL"
            name="websiteURL"
            value={formData.websiteURL}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="LinkedIn URL"
            name="linkdinURL"
            value={formData.linkdinURL}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="WhatsApp Number"
            name="whatsUpNumber"
            value={formData.whatsUpNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="tel"
          />
          <TextField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="User ID"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />


          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Add Lead
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}