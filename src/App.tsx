import { Loading } from 'solid-js';
import { Router } from './router';
import './styles/index.css';
import MainLayout from './components/MainLayout/MainLayout';
import { AuthProvider } from './features/auth/components/AuthContext';

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Loading fallback={<main>Loading…</main>}>
            <AuthProvider>
              <MainLayout>
                {props.children}
              </MainLayout>
            </AuthProvider>
          </Loading>
        </>
      )}
    </Router>
  );
}
