import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { TaskActionsProvider } from './context/TaskActionsContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TaskActionsProvider>
          <App />
        </TaskActionsProvider>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: { fontSize: '14px', borderRadius: '8px' },
          success: { iconTheme: { primary: '#4566ec', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);
