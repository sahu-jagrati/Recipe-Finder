import { BrowserRouter } from 'react-router-dom';
import { RecipeProvider } from './context/RecipeContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <RecipeProvider>
        <Navbar />
        <main>
          <AppRoutes />
        </main>
      </RecipeProvider>
    </BrowserRouter>
  );
}
