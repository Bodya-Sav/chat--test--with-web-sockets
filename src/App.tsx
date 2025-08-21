import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import styles from './styles/App.module.css';
import { UserProvider } from './context/UserProvider';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className={styles.root}>
      <BrowserRouter>
        <UserProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={3000}
            toastOptions={{
              style: {
                background: "#f9aaaaff",
                color: "#e20f0fff",
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              },
            }}
          />
        </UserProvider>
      </BrowserRouter>
    </div>
  );
}