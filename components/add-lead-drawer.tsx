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
import { toast } from 'react-hot-toast';
import ApiService from "../app/utils/api"

const drawerWidth = 400;

export default function AddLeadDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    websiteURL: '',
    linkdinURL: '',
    whatsUpNumber: '',
    status: '',
    workEmail: '',
    userId: '',
    priority: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simple email validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.email) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error('Invalid Email Address');
      return;
    }

    try {
      setLoading(true);
      const res = await ApiService.create('/api/v1/lead', formData);

      if (res) {
        toast.success('Lead added successfully');
        setFormData({
          firstName: '',
          email: '',
          websiteURL: '',
          linkdinURL: '',
          whatsUpNumber: '',
          status: '',
          workEmail: '',
          userId: '',
          priority: '',
        });
        onClose();
      }
    } catch (error) {
      toast.error('Failed to add lead');
      console.error('Error adding lead:', error);
    } finally {
      setLoading(false);
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

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ p: 3, flex: 1, overflowY: 'auto' }}
        >
          <TextField
            label="First Name *"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email *"
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
            InputProps={{ readOnly: true }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Adding...' : 'Add Lead'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
