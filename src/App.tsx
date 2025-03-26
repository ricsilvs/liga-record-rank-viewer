import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Analytics from "./components/Analytics";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="flex h-8 items-center px-4">
            <div className="flex space-x-4">
              <Link to="/" className="text-sm hover:font-bold">
                Home
              </Link>
              <Link to="/analytics" className="text-sm hover:font-bold">
                Analytics
              </Link>
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
  );
}

export default App;
