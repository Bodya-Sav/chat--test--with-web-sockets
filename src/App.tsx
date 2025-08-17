import { StrictMode } from 'react'
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import styles from './styles/App.module.css';
import { UserProvider } from './context/UserProvider';

export default function App() {
  return (
    <div className={styles.root}>
      <StrictMode>
        <BrowserRouter>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </BrowserRouter>
      </StrictMode>

    </div>
  );
}