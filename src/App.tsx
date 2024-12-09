import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Auth } from './pages/Auth';
import { AuthCallback } from './components/AuthCallback';
import { Documents } from './pages/Documents';
import { SignUp } from './pages/SignUp';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useTheme } from './hooks/useTheme';

function App() {
  const { isDark } = useTheme();

  return (
    <Router>
      <div className={`min-h-screen ${isDark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <Header />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;