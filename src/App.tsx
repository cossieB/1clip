import { Loading, onSettled, refresh } from 'solid-js';
import { Router } from './router';
import './styles/index.css';
import { ToastProvider } from './components/Toast/ToastProvider';
import { session } from './features/auth/authApi';

export default function App() {
  const refetch = () => refresh(session);

  onSettled(() => {
    window.addEventListener("focus", refetch)
    return () => {
      window.removeEventListener("focus", refetch)
    }
  })

  return (
    <Router>
      {(props) => (
        <>
          <Loading fallback={<main>Loading…</main>}>
            <ToastProvider>
              {props.children}
            </ToastProvider>
          </Loading>
        </>
      )}
    </Router>
  );
}
