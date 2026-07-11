import { useState, type FormEvent } from 'react'
import { ApiError } from '../../api/http'
import type { Contact, ContactInput } from '../../api/types'
import { Modal } from '../../components/ui/Modal'

const KNOWN_SEGMENTS = ['Plano Black', 'Plano Fit', 'Corporativo']

interface ContactFormProps {
  contact?: Contact
  isSubmitting: boolean
  onSubmit: (input: ContactInput) => Promise<void>
  onClose: () => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ContactForm({ contact, isSubmitting, onSubmit, onClose }: ContactFormProps) {
  const [name, setName] = useState(contact?.name ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [segment, setSegment] = useState(contact?.segment ?? '')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isEdit = contact !== undefined

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    if (!name.trim()) {
      setFieldError('Nome é obrigatório.')
      return
    }
    if (!email.trim()) {
      setFieldError('E-mail é obrigatório.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setFieldError('E-mail em formato inválido.')
      return
    }
    setFieldError(null)

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        segment: segment.trim() || null,
      })
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível salvar o contato.')
    }
  }

  const displayedError = fieldError ?? submitError

  return (
    <Modal title={isEdit ? 'Editar contato' : 'Novo contato'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {displayedError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{displayedError}</p>
        ) : null}

        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact-segment" className="block text-sm font-medium text-slate-700">
            Segmento <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="contact-segment"
            type="text"
            value={segment ?? ''}
            onChange={(event) => setSegment(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {KNOWN_SEGMENTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSegment(option)}
                className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar contato'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
