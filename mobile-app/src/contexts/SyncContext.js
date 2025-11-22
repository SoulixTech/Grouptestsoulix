import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { AppState } from 'react-native';

const SyncContext = createContext();

export function SyncProvider({ children }) {
  const [syncStatus, setSyncStatus] = useState('synced'); // 'syncing', 'synced', 'error'
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    // Subscribe to expenses changes
    const expensesSubscription = supabase
      .channel('mobile_expenses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          console.log('📝 Expenses changed:', payload.eventType);
          handleDataChange('expenses');
        }
      )
      .subscribe();

    // Subscribe to members changes
    const membersSubscription = supabase
      .channel('mobile_members_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          console.log('👥 Members changed:', payload.eventType);
          handleDataChange('members');
        }
      )
      .subscribe();

    // Subscribe to payments changes
    const paymentsSubscription = supabase
      .channel('mobile_payments_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('💳 Payments changed:', payload.eventType);
          handleDataChange('payments');
        }
      )
      .subscribe();

    // Handle app state changes (foreground/background)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active - syncing data');
        handleDataChange('app_resumed');
      }
    });

    // Cleanup
    return () => {
      expensesSubscription.unsubscribe();
      membersSubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const handleDataChange = (source) => {
    setSyncStatus('syncing');
    
    setTimeout(() => {
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      setDataVersion(prev => prev + 1); // Increment to trigger re-renders
      console.log(`✅ Synced from ${source}`);
    }, 500);
  };

  const forceSync = () => {
    handleDataChange('manual');
  };

  return (
    <SyncContext.Provider value={{ 
      syncStatus, 
      lastSyncTime, 
      dataVersion,
      forceSync 
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
