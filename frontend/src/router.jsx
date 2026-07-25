import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './App.jsx'
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GoogleCallbackPage from './pages/GoogleCallbackPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import ChatHistoryPage from './pages/ChatHistoryPage'
import FileUploadPage from './pages/FileUploadPage'
import PDFSummarizePage from './pages/PDFSummarizePage'
import CodeGenPage from './pages/CodeGenPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SharedChatPage from './pages/SharedChatPage'
import PromptLibraryPage from './pages/PromptLibraryPage'

const protect = (Component) => (
  <ProtectedRoute>
    <AppLayout><Component /></AppLayout>
  </ProtectedRoute>
)

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/auth/google/callback", element: <GoogleCallbackPage /> },
  { path: "/share/:shareId", element: <SharedChatPage /> },

  { path: "/dashboard", element: protect(DashboardPage) },
  { path: "/chat", element: protect(ChatPage) },
  { path: "/history", element: protect(ChatHistoryPage) },
  { path: "/upload", element: protect(FileUploadPage) },
  { path: "/summarize", element: protect(PDFSummarizePage) },
  { path: "/codegen", element: protect(CodeGenPage) },
  { path: "/profile", element: protect(ProfilePage) },
  { path: "/settings", element: protect(SettingsPage) },
  { path: "/prompts", element: protect(PromptLibraryPage) },

  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})
