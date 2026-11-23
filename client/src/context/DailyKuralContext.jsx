import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { publicService } from '../services/publicService';
import { isAbortError } from '../utils/userFacingError';

const DailyKuralContext = createContext(null);
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const pickKural = (payload) => {
  if (!payload) return null;
  if (payload.kural && (payload.kural.tamil_text || payload.kural.kural_number)) {
    return payload.kural;
  }
  if (Array.isArray(payload.kurals) && payload.kurals[0]) {
    return payload.kurals[0];
  }
  if (payload.tamil_text || payload.kural_number) {
    return payload;
  }
  return null;
};

export const DailyKuralProvider = ({ children }) => {
  const [kural, setKural] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const kuralRef = useRef(null);

  useEffect(() => {
    kuralRef.current = kural;
  }, [kural]);

  useEffect(() => {
    const controller = new AbortController();

    const loadDailyKural = async () => {
      try {
        const daily = await publicService.getDailyKural({ signal: controller.signal });
        let verse = pickKural(daily);

        if (!verse) {
          const list = await publicService.getKurals({}, { signal: controller.signal });
          verse = pickKural(list);
        }

        if (controller.signal.aborted) return;

        if (verse) {
          setKural(verse);
          setModalOpen(true);
        } else {
          setKural(null);
        }
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) return;
        setKural(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDailyKural();

    const intervalId = window.setInterval(() => {
      if (kuralRef.current) {
        setModalOpen(true);
      }
    }, FIVE_MINUTES_MS);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const closeModal = () => {
    setModalOpen(false);
  };

  const openModal = () => {
    if (kuralRef.current) {
      setModalOpen(true);
    }
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
