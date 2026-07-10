import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { SummaryPage } from './features/analytics/SummaryPage'
import { ContactsPage } from './features/contacts/ContactsPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<SummaryPage />} />
        <Route path="contatos" element={<ContactsPage />} />
      </Route>
    </Routes>
  )
}
