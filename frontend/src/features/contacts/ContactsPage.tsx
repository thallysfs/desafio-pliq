import { useEffect, useState } from 'react'
import type { Contact, ContactInput } from '../../api/types'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Loading } from '../../components/ui/Loading'
import { Pagination } from '../../components/ui/Pagination'
import { QueryState } from '../../components/ui/QueryState'
import { SearchInput } from '../../components/ui/SearchInput'
import { useToast } from '../../components/ui/Toast'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { ContactForm } from './ContactForm'
import { ContactsTable } from './ContactsTable'
import { useContacts } from './useContacts'
import { useCreateContact, useDeleteContact, useUpdateContact } from './useContactMutations'

const PAGE_SIZE = 20

type FormState = { mode: 'create' } | { mode: 'edit'; contact: Contact } | null

export function ContactsPage() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 400)
  const [page, setPage] = useState(1)
  const [formState, setFormState] = useState<FormState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)

  const { showToast } = useToast()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isPending, isError, error, refetch, isFetching } = useContacts({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()

  async function handleFormSubmit(input: ContactInput) {
    if (formState?.mode === 'edit') {
      await updateContact.mutateAsync({ id: formState.contact.id, input })
      showToast('success', 'Contato atualizado.')
    } else {
      await createContact.mutateAsync(input)
      showToast('success', 'Contato criado.')
    }
    setFormState(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteContact.mutateAsync(deleteTarget.id)
      showToast('success', 'Contato excluído.')
      setDeleteTarget(null)
    } catch {
      return
    }
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contatos</h1>
          <p className="mt-1 text-slate-500">Alunos cadastrados na base de respostas.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormState({ mode: 'create' })}
          className="shrink-0 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Novo contato
        </button>
      </div>

      <div className="mt-6 max-w-sm">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Buscar por nome ou e-mail…"
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white">
        <QueryState
          isPending={isPending}
          isError={isError}
          error={error}
          data={data}
          onRetry={() => void refetch()}
          loading={<Loading />}
          isEmpty={(result) => result.items.length === 0}
          empty={
            <EmptyState
              title="Nenhum contato encontrado"
              description={
                debouncedSearch
                  ? `Não encontramos resultados para "${debouncedSearch}".`
                  : 'Ainda não há contatos cadastrados.'
              }
            />
          }
        >
          {(result) => (
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              <div className="overflow-x-auto px-4">
                <ContactsTable
                  contacts={result.items}
                  onEdit={(contact) => setFormState({ mode: 'edit', contact })}
                  onDelete={(contact) => setDeleteTarget(contact)}
                />
              </div>
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={result.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </QueryState>
      </div>

      {formState ? (
        <ContactForm
          contact={formState.mode === 'edit' ? formState.contact : undefined}
          isSubmitting={createContact.isPending || updateContact.isPending}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Excluir contato"
          message={`Tem certeza que deseja excluir "${deleteTarget.name}"? As respostas dele deixarão de aparecer no histórico.`}
          confirmLabel="Excluir"
          isLoading={deleteContact.isPending}
          error={deleteContact.error?.message}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </section>
  )
}
