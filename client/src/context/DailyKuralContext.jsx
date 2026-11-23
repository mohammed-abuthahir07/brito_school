import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { publicService } from '../services/publicService';

const DailyKuralContext = createContext(null);

export const DailyKuralProvider = ({ children }) => {
  const [kural, setKural] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const fetchInitiated = useRef(false);

  // Fetch daily kural once and share between modal and Home page
  const fetchDailyKural = () => {
    publicService.getDailyKural()
      .then((res) => {
        if (res.success && res.kural) {
          setKural(res.kural);
          // Show modal immediately on website open / refresh
          setModalOpen(true);
        } else {
          setKural(null);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch daily kural:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!fetchInitiated.current) {
      fetchInitiated.current = true;
      fetchDailyKural();
    }

    // Interval: Trigger modal display every 5 minutes (300,000 ms)
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const intervalId = setInterval(() => {
      setModalOpen(true);
    }, FIVE_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  return (
    <DailyKuralContext.Provider
      value={{
        kural,
        loading,
        modalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </DailyKuralContext.Provider>
  );
};

export const useDailyKural = () => {
  const context = useContext(DailyKuralContext);
  if (!context) {
    throw new Error('useDailyKural must be used within a DailyKuralProvider');
  }
  return context;
};
