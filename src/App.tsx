import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LaunchScreen from './pages/LaunchScreen';
import CaptureScreen from './pages/CaptureScreen';
import ConfirmScreen from './pages/ConfirmScreen';
import VerifyScreen from './pages/VerifyScreen';
import DashboardScreen from './pages/DashboardScreen';
import AnalyticsScreen from './pages/AnalyticsScreen';
import WatermarkTestScreen from './pages/WatermarkTestScreen';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LaunchScreen />} />
          <Route path="/capture" element={<CaptureScreen />} />
          <Route path="/confirm" element={<ConfirmScreen />} />
          <Route path="/verify/:id" element={<VerifyScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/watermark-test" element={<WatermarkTestScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 