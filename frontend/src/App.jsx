import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import PropertyDetail from "./pages/PropertyDetail";
import Listings from "./pages/Listings";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Lands from "./pages/Lands";

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
        <Route path="/listings" element={<Listings />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/authentication" element={<Auth />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/looking-for-a-piece-of-land"element={<Lands />} />
      </Routes>
      {!isDashboard && <Footer />}
    </>
  );
}

export default App;
