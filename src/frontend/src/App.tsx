import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CharacterProvider } from './contexts/CharacterContext'
import { NotificationProvider } from './components/NotificationSystem'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CharacterPage from './pages/CharacterPage'
import SettingsPage from './pages/SettingsPage'

function App() {
    return (
        <NotificationProvider>
            <AuthProvider>
                <CharacterProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/character/:characterId" element={<CharacterPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                            </Routes>
                        </Layout>
                    </Router>
                </CharacterProvider>
            </AuthProvider>
        </NotificationProvider>
    )
}

export default App
