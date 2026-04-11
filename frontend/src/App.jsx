import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import PropertyDetail from "./pages/PropertyCard";

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
      </Routes>
      {/* {!isDashboard && <Footer />} */}
    </>
  );
}

export default App;
