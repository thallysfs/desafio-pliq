import type { Contact } from '../../api/types'

interface ContactsTableProps {
  contacts: Contact[]
  onViewHistory: (contact: Contact) => void
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

export function ContactsTable({ contacts, onViewHistory, onEdit, onDelete }: ContactsTableProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2 font-medium">Nome</th>
          <th className="py-2 font-medium">E-mail</th>
          <th className="py-2 font-medium">Segmento</th>
          <th className="py-2 font-medium text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id} className="border-b border-slate-100 last:border-0">
            <td className="py-2.5 text-slate-900">{contact.name}</td>
            <td className="py-2.5 text-slate-600">{contact.email}</td>
            <td className="py-2.5 text-slate-600">{contact.segment ?? '—'}</td>
            <td className="py-2.5 text-right">
              <button
                type="button"
                onClick={() => onViewHistory(contact)}
                className="rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100"
              >
                Histórico
              </button>
              <button
                type="button"
                onClick={() => onEdit(contact)}
                className="ml-1 rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(contact)}
                className="ml-1 rounded-md px-2 py-1 font-medium text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
