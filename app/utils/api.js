import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/v1"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


const ApiService = {
  // GET All
  getAll: async (endpoint) => {
    try {
      const response = await api.get(`/${endpoint}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET by ID
  getById: async (endpoint, id) => {
    try {
      const response = await api.get(`/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // CREATE
  create: async (endpoint, data) => {
    try {
      const response = await api.post(`/${endpoint}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE
  update: async (endpoint, id, data) => {
    try {
      const response = await api.put(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE
  remove: async (endpoint, id) => {
    try {
      const response = await api.delete(`/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default ApiService;
