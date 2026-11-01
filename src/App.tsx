import { Loading } from 'solid-js';
import { Router } from './router';
import './styles/index.css';
import MainLayout from './components/MainLayout/MainLayout';

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Loading fallback={<main>Loading…</main>}>
            <MainLayout>
              {props.children}
            </MainLayout>
          </Loading>
        </>
      )}
    </Router>
  );
}
