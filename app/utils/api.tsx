import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
//token automatically save
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
  }
  return config;
});
//login 
export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
// GET All
export const getAll = async (endpoint: string,params:Record<string,any>={}) => {
  try {
    const response = await api.get(endpoint,{ params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  GET by ID
export const getById = async (endpoint: string, id: string) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  CREATE
export const createOne = async (endpoint: string, data: any) => {
  try {
    const response = await api.post(`/${endpoint}`,data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  UPDATE (renamed to updateOne so it matches leads/page.tsx)
export const updateOne = async (endpoint: string, id: string, data: any) => {
  try {
    const response = await api.put(endpoint);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

//  DELETE
export const deleteOne = async (endpoint: string, id: string) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
