import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AuthProvider, useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/" />
}

function DebugInfo() {
  const { tg } = useAuth()
  if (tg?.initDataUnsafe?.user?.id) {
    return (
      <div style={{
        bottom: 0, 
        right: 0, 
        padding: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white',
        fontSize: '12px',
        maxWidth: '300px',
        wordBreak: 'break-all',
        marginTop: '25px'
      }}>
        <strong>Debug Info:</strong>
        <pre style={{margin: '5px 0' }}>
          {Object.entries(tg?.initDataUnsafe?.user || {}).map(([key, value]) => (
            <div style={{whiteSpace: 'normal'}} key={key}>{key}: {value}</div>
          ))}
        </pre>
      </div>
    )
  }
  return null
}

function App() {
  return (
    <AuthProvider>
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
        <DebugInfo />
      </div>
    </AuthProvider>
  )
}

export default App 