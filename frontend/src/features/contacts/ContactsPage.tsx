import { useEffect, useState } from 'react'
import { EmptyState } from '../../components/ui/EmptyState'
import { Loading } from '../../components/ui/Loading'
import { Pagination } from '../../components/ui/Pagination'
import { QueryState } from '../../components/ui/QueryState'
import { SearchInput } from '../../components/ui/SearchInput'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useContacts } from './useContacts'
import { ContactsTable } from './ContactsTable'

const PAGE_SIZE = 20

export function ContactsPage() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 400)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isPending, isError, error, refetch, isFetching } = useContacts({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <section>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Contatos</h1>
        <p className="mt-1 text-slate-500">Alunos cadastrados na base de respostas.</p>
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
                <ContactsTable contacts={result.items} />
              </div>
              <Pagination
                page={result.page}
                pageSize={result.pageSize}
                total={result.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </QueryState>
      </div>
    </section>
  )
}
