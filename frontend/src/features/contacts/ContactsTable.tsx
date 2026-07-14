import { ChevronRight, Trash2 } from 'lucide-react'
import type { Contact } from '../../api/types'
import { avatarTint, initials } from '../../utils/avatar'

interface ContactsTableProps {
  contacts: Contact[]
  onOpen: (contact: Contact) => void
  onDelete: (contact: Contact) => void
}

export function ContactsTable({ contacts, onOpen, onDelete }: ContactsTableProps) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line">
          <th className="px-5 py-3.5 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
            Aluno
          </th>
          <th className="px-5 py-3.5 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
            Segmento
          </th>
          <th className="px-5 py-3.5 text-right text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {contacts.map((contact) => (
          <tr
            key={contact.id}
            onClick={() => onOpen(contact)}
            className="group cursor-pointer transition-colors hover:bg-surface-2"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarTint(
                    contact.id,
                  )}`}
                >
                  {initials(contact.name)}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink">{contact.name}</div>
                  <div className="truncate text-xs text-muted">{contact.email}</div>
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5">
              {contact.segment ? (
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
                  {contact.segment}
                </span>
              ) : (
                <span className="text-muted">—</span>
              )}
            </td>
            <td className="px-5 py-3.5">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(contact)
                  }}
                  title="Excluir aluno"
                  aria-label={`Excluir ${contact.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors group-hover:text-primary"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
