import { Loading } from 'solid-js';
import { Router } from './router';
import './styles/index.css';
import MainLayout from './components/MainLayout/MainLayout';
import { ToastProvider } from './components/Toast/ToastProvider';

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Loading fallback={<main>Loading…</main>}>
            <ToastProvider>
              <MainLayout>
                {props.children}
              </MainLayout>
            </ToastProvider>
          </Loading>
        </>
      )}
    </Router>
  );
}
