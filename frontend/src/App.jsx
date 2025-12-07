import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Homepage from './pages/Homepage'
import Dashboard from './pages/Dashboard'
import SpendingInsights from './pages/SpendingInsights'
import Settings from './pages/Settings'
import Goals from './pages/Goals'
import Subscriptions from './pages/Subscriptions'
import Portfolio from './pages/Portfolio'
import Coach from './pages/Coach'
import TimeMachine from './pages/TimeMachine'
import Login from './pages/Login'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Homepage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="insights" element={<SpendingInsights />} />
        <Route path="time-machine" element={<TimeMachine />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="coach" element={<Coach />} />
        <Route path="goals" element={<Goals />} />
        <Route path="settings" element={<Settings />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
      </Route>
    </Routes>
  )
}

export default App
