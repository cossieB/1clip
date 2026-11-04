import { Loading } from 'solid-js';
import { Router } from './router';
import './styles/index.css';
import { ToastProvider } from './components/Toast/ToastProvider';

export default function App() {
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
