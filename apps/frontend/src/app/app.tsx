import { Navigate, Route, Routes } from 'react-router-dom';
import { PortfolioPage } from '../features/portfolio/PortfolioPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
