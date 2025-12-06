import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Homepage from './pages/Homepage'
import Dashboard from './pages/Dashboard'
import SpendingInsights from './pages/SpendingInsights'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import Subscriptions from './pages/Subscriptions'
import Portfolio from './pages/Portfolio'
import Coach from './pages/Coach'
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
        <Route path="transactions" element={<Transactions />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="coach" element={<Coach />} />
        <Route path="settings" element={<Settings />} />
        <Route path="account" element={<Settings />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
      </Route>
    </Routes>
  )
}

export default App
