/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../componen/layout/Layout'
import { Barang } from '../../componen/admin/Barang';
import { Me } from '../../fitur/AuthSlice';

export const BarangPages = () => {
     const dispatch = useDispatch();
        const navigate = useNavigate();
        const { isError, user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
    
        useEffect(() => {
            if (!user && !isLoading) {
                dispatch(Me())
                    .unwrap()
                    .catch(() => {
                        navigate('/');
                    });
            }
        }, [dispatch, navigate, user, isLoading]);
    
        useEffect(() => {
            if (isError && !user) {
                navigate('/');
            }
        }, [isError, user, navigate]);
    
        if (isLoading) {
            return <div>Loading...</div>;
        }
    
        if (!user) {
            return <div>Loading...</div>;
        }
  return (
    <Layout>
        <Barang />
    </Layout>
  )
}
