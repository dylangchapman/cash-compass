import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SpendingInsights from './pages/SpendingInsights'
import Goals from './pages/Goals'
import Subscriptions from './pages/Subscriptions'
import Portfolio from './pages/Portfolio'
import Coach from './pages/Coach'
import Login from './pages/Login'
import Account from './pages/Account'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="insights" element={<SpendingInsights />} />
        <Route path="goals" element={<Goals />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="coach" element={<Coach />} />
        <Route path="account" element={<Account />} />
      </Route>
    </Routes>
  )
}

export default App
