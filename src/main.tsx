import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import HomeLayout from '../components/HomeLayout';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomeLayout />
  </StrictMode>
);
