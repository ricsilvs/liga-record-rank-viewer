import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Analytics from "./components/Analytics";
import { cn } from "./lib/utils";
import { RankingsProvider } from "./context/RankingsContext";

function App() {
  return (
    <RankingsProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <nav className="border-b">
            <div className="flex h-8 items-center px-4">
              <div className="flex space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cn("text-sm hover:font-bold", {
                      "font-bold": isActive,
                    })
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    cn("text-sm hover:font-bold", {
                      "font-bold": isActive,
                    })
                  }
                >
                  Analytics
                </NavLink>
              </div>
            </div>
          </nav>
          <main className="container mx-auto py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RankingsProvider>
  );
}

export default App;
