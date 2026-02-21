import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar, Footer } from "@/app/components/layout";
import { HomePage, AdminPage } from "@/app/pages";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background d-flex flex-column min-vh-100">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
