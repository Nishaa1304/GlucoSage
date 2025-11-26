import AppRouter from './router/AppRouter';
import { UserProvider } from './context/UserContext';
import { ABHAProvider } from './context/ABHAContext';
import { PredictionProvider } from './context/PredictionContext';
import './styles/globals.css';

function App() {
  return (
    <UserProvider>
      <ABHAProvider>
        <PredictionProvider>
          <AppRouter />
        </PredictionProvider>
      </ABHAProvider>
    </UserProvider>
  );
}

export default App;
