import { History, Pencil, Trash2 } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Contact } from '../../api/types'

interface ContactsTableProps {
  contacts: Contact[]
  onViewHistory: (contact: Contact) => void
  onEdit: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

interface RowActionButtonProps {
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  danger?: boolean
}

function RowActionButton({ label, icon: Icon, onClick, danger }: RowActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-500 ${
        danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-surface-2 hover:text-slate-900'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
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
            <td className="py-2.5 text-slate-600">
              {contact.segment ? (
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
                  {contact.segment}
                </span>
              ) : (
                '—'
              )}
            </td>
            <td className="py-2.5">
              <div className="flex justify-end gap-0.5">
                <RowActionButton
                  label="Ver histórico de respostas"
                  icon={History}
                  onClick={() => onViewHistory(contact)}
                />
                <RowActionButton
                  label="Editar contato"
                  icon={Pencil}
                  onClick={() => onEdit(contact)}
                />
                <RowActionButton
                  label="Excluir contato"
                  icon={Trash2}
                  onClick={() => onDelete(contact)}
                  danger
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
