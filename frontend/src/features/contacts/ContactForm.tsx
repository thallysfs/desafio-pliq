import { Pencil, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../api/http'
import type { Contact, ContactInput } from '../../api/types'
import { Modal } from '../../components/ui/Modal'
import { SegmentField } from './SegmentField'
import { toContactInput, validateContact } from './contactValidation'

interface ContactFormProps {
  contact?: Contact
  isSubmitting: boolean
  onSubmit: (input: ContactInput) => Promise<void>
  onClose: () => void
}

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-surface-1 px-3.5 py-2.5 text-sm text-ink focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/40 focus:outline-none'

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

    const validationError = validateContact({ name, email })
    if (validationError) {
      setFieldError(validationError)
      return
    }
    setFieldError(null)

    try {
      await onSubmit(toContactInput(name, email, segment ?? ''))
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Não foi possível salvar o aluno.')
    }
  }

  const displayedError = fieldError ?? submitError

  return (
    <Modal
      title={isEdit ? 'Editar aluno' : 'Novo aluno'}
      onClose={onClose}
      icon={isEdit ? Pencil : UserPlus}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {displayedError ? (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{displayedError}</p>
        ) : null}

        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-ink">
            Nome
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-ink">
            E-mail
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </div>

        <SegmentField value={segment ?? ''} onChange={setSegment} />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar aluno'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
