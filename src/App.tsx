import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { Layout } from '@/components/Layout/Layout'
import { FileManager } from '@/components/FileManager/FileManager'
import { EditorPage } from '@/components/Editor/EditorPage'
import { SettingsPage } from '@/components/Settings/SettingsPage'
import { LandingPage } from '@/components/Landing/LandingPage'
import { TermsPage } from '@/components/Legal/TermsPage'
import { PrivacyPage } from '@/components/Legal/PrivacyPage'

function AppRoutes() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  return (
    <Routes>
      <Route path="/app" element={
        <Layout theme={theme} resolvedTheme={resolvedTheme} setTheme={setTheme}>
          <FileManager />
        </Layout>
      } />
      <Route path="/app/doc/:id" element={
        <Layout theme={theme} resolvedTheme={resolvedTheme} setTheme={setTheme}>
          <EditorPage resolvedTheme={resolvedTheme} />
        </Layout>
      } />
      <Route path="/app/settings" element={
        <Layout theme={theme} resolvedTheme={resolvedTheme} setTheme={setTheme}>
          <SettingsPage theme={theme} setTheme={setTheme} />
        </Layout>
      } />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/" element={<LandingPage resolvedTheme={resolvedTheme} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
