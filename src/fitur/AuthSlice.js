/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL;
const initialState = {
    user: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
    isAuthenticated: false,
}

export const Login = createAsyncThunk("user/login", async (user, thunkAPI) => {
    try {
        const response = await axios.post(`${getApiBaseUrl()}/login`,
            new URLSearchParams({
                username: user.username,
                password: user.password
            }), {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
          console.log("Login response:", response.data);
        return response.data;
    }catch (error) {
        if (error.response) {
            const message = error.response.data.msg || error.response.data.message || error.response.data;
            return thunkAPI.rejectWithValue(
                typeof message === 'string' ? message : 'Terjadi kesalahan saat login'
            );
        }
        return thunkAPI.rejectWithValue("Gagal terhubung ke server");
    }
});
export const Me = createAsyncThunk("user/me", async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${getApiBaseUrl()}/me`, {
            withCredentials: true
        });
         console.log("Me response:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            const message = error.response.data.msg;
            return thunkAPI.rejectWithValue(message);
        }
        return thunkAPI.rejectWithValue("Failed to fetch user data");
    }
});

export const Logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
    try {
        await axios.delete(`${getApiBaseUrl()}/logout`, {
            withCredentials: true
        });
        return null;
    } catch (error) {
        return thunkAPI.rejectWithValue("Failed to logout");
    }
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => {
            Object.assign(state, initialState);
        },
        clearUserData: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(Login.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = "";
            })
            .addCase(Login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.message = "";
            })
            .addCase(Login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Me cases
            .addCase(Me.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(Me.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.message = "";
            })
            .addCase(Me.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Logout cases
            .addCase(Logout.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(Logout.fulfilled, (state) => {
                Object.assign(state, initialState);
            })
            .addCase(Logout.rejected, (state) => {
                state.isLoading = false;
                // Still clear the state even if logout API fails
                Object.assign(state, initialState);
            });
    },
});

export const { reset, clearUserData } = authSlice.actions;
export default authSlice.reducer;