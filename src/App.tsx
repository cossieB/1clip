import { Loading } from 'solid-js';
import { Router } from './router';
import './styles/index.css';

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Loading fallback={<main>Loading…</main>}>
            <main>
              {props.children}
            </main>
          </Loading>
        </>
      )}
    </Router>
  );
}
