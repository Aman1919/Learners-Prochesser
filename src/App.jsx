import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'
import Login from './components/Login'
import SignUp from './components/Signup'
import Homepage from './components/Homepage'
import Navbar from './components/Navbar'
import FrequentlyAskedQuestions from './components/FAQ'
import Footer from './components/Footer'
import About from './components/About'
import Testimonials from './components/Testimonials'
import Newsletter from './components/Newsletter'
import HowItWorks from './components/Howitworks'
function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/faqs" element={<FrequentlyAskedQuestions />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/testimonials" element={<Testimonials/>} />
          <Route path="/subscribe" element ={<Newsletter/>} />
          <Route path="/how-it-works" element={<HowItWorks/>}/>
        </Routes>
        <Footer/>
      </div>
    </Router>
  )
}

export default App
