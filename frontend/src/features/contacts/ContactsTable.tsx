import type { Contact } from '../../api/types'

interface ContactsTableProps {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2 font-medium">Nome</th>
          <th className="py-2 font-medium">E-mail</th>
          <th className="py-2 font-medium">Segmento</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id} className="border-b border-slate-100 last:border-0">
            <td className="py-2.5 text-slate-900">{contact.name}</td>
            <td className="py-2.5 text-slate-600">{contact.email}</td>
            <td className="py-2.5 text-slate-600">{contact.segment ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
