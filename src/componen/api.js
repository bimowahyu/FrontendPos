/* eslint-disable no-unused-vars */
// utils/api.js
import axios from 'axios';
import useSWR, { mutate } from "swr";

export const getApiBaseUrl = () => {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/^https?:\/\//, "");
  return `${protocol}://${baseUrl}`;
};

export const fetchMenuData = async ( tableId) => {
  try {
    const productsResponse = await axios.get(`${getApiBaseUrl()}/tableproduk/${tableId}`);
    const categoriesResponse = await axios.get(`${getApiBaseUrl()}/getkategori`);
    
    return {
      products: productsResponse.data.data.products,
      tableInfo: productsResponse.data.data.table,
      categories: categoriesResponse.data.data || []
    };
  } catch (err) {
    console.error("Error fetching data:", err);
    throw new Error(err.response?.data?.message || "Failed to load menu data");
  }
};



