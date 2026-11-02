import { Navigate, Route, Routes } from 'react-router';
import Home from './pages/Home';
import Search from './pages/Search';
import Welcome from './pages/Welcome';
import { hasOnboarded } from './lib/onboarding';

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/"
        element={
          <RequireOnboarding>
            <Screen>
              <Home />
            </Screen>
          </RequireOnboarding>
        }
      />
      <Route
        path="/search"
        element={
          <Screen>
            <Search />
          </Screen>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// checked while rendering the route (not when App renders) so it picks up
// the flag that Welcome sets right before navigating here
function RequireOnboarding({ children }) {
  return hasOnboarded() ? children : <Navigate to="/welcome" replace />;
}

function Screen({ children }) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] sm:px-6 md:max-w-2xl md:pt-10">
      {children}
    </main>
  );
}
