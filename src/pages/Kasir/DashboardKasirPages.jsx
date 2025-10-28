/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardKasir from '../../componen/kasir/DashboardKasir';
import { Me } from '../../fitur/AuthSlice';

const DashboardKasirPages = () => {
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
    <>
        <DashboardKasir />
    </>
  )
}

export default DashboardKasirPages