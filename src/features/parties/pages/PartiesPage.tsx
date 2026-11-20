import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  ContactRound,
  Loader2,
  Settings2,
  UserCheck,
  UserPlus,
  UserRoundX,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert } from 'src/components/ui/Alert'
import { Button } from 'src/components/ui/Button'
import { Card } from 'src/components/ui/Card'
import { Modal, ModalContent } from 'src/components/ui/Modal'
import { SearchInput } from 'src/components/ui/SearchInput'
import { Select } from 'src/components/ui/Select'
import { Skeleton } from 'src/components/ui/Skeleton'
import { StatCard } from 'src/components/ui/StatCard'
import { PartyAvatar, StatusBadge } from 'src/features/parties/components/PartyBits'
import { PartyForm } from 'src/features/parties/components/PartyForm'
import { PartyTypeManager } from 'src/features/parties/components/PartyTypeManager'
import { useParties } from 'src/features/parties/hooks/useParties'
import { usePartiesOverview } from 'src/features/parties/hooks/usePartiesOverview'
import { usePartyTypes } from 'src/features/parties/hooks/usePartyTypes'
import { useCreateParty } from 'src/features/parties/hooks/usePartyMutations'
import type { Party, PartyInput } from 'src/features/parties/types'
import { mapApiError } from 'src/features/auth'
import { partyDetail } from 'src/lib/paths'
import { cn } from 'src/lib/cn'
import { translate } from 'src/lib/i18n'

type StatusFilter = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 10

export function PartiesPage() {
  const { t } = useTranslation(['parties', 'common', 'errors'])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [typeId, setTypeId] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const create = useCreateParty()
  const overview = usePartiesOverview()
  const types = usePartyTypes()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  const parties = useParties({
    search: debouncedSearch || undefined,
    party_type_id: typeId || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    page,
    limit: PAGE_SIZE,
  })

  function handleCreate(input: PartyInput): void {
    setFormError(undefined)
    create.mutate(input, {
      onSuccess() {
        setFormOpen(false)
        setSearch('')
        setDebouncedSearch('')
        setPage(1)
      },
      onError(error: unknown) {
        setFormError(translate(t, mapApiError(error).messageKey))
      },
    })
  }

  const result = parties.data
  const rows = result?.parties ?? []
  const totalPages = result?.pagination.total_pages ?? 1
  const stats = overview.data
  const statsLoading = overview.isLoading
  const statValue = (value: number | undefined): number | string =>
    overview.isError ? '—' : (value ?? 0)
  const filtered = Boolean(debouncedSearch) || status !== 'all' || Boolean(typeId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-bold text-charcoal">
            {t('parties:title')}
          </h2>
          <p className="mt-1 text-sm text-charcoal-500">{t('parties:subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setTypesOpen(true)}>
            <Settings2 aria-hidden="true" className="size-4" />
            {t('parties:manageTypes')}
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <UserPlus aria-hidden="true" className="size-4" />
            {t('parties:add')}
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3"
        aria-busy={statsLoading || undefined}
      >
        <StatCard
          label={t('parties:overview.total')}
          value={statValue(stats?.total)}
          loading={statsLoading}
          icon={<ContactRound aria-hidden="true" className="size-4" />}
          active={status === 'all'}
          onClick={() => {
            setStatus('all')
            setPage(1)
          }}
        />
        <StatCard
          label={t('parties:overview.active')}
          value={statValue(stats?.active)}
          loading={statsLoading}
          icon={<UserCheck aria-hidden="true" className="size-4" />}
          active={status === 'active'}
          onClick={() => {
            setStatus('active')
            setPage(1)
          }}
        />
        <StatCard
          label={t('parties:overview.inactive')}
          value={statValue(stats?.inactive)}
          loading={statsLoading}
          icon={<UserRoundX aria-hidden="true" className="size-4" />}
          active={status === 'inactive'}
          onClick={() => {
            setStatus('inactive')
            setPage(1)
          }}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3 sm:max-w-md">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder={t('parties:searchPlaceholder')}
            aria-label={t('common:search')}
          />
          {parties.isFetching && !parties.isLoading ? (
            <Loader2
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin text-charcoal-400"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            aria-label={t('parties:filterByType')}
            value={typeId}
            onChange={(event) => {
              setTypeId(event.target.value)
              setPage(1)
            }}
            className="min-h-11 w-44"
          >
            <option value="">{t('parties:allTypes')}</option>
            {types.data?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          <div
            role="group"
            aria-label={t('parties:filterLabel')}
            className="inline-flex rounded-sm border border-line bg-card-alt p-0.5"
          >
            {(['all', 'active', 'inactive'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value)
                  setPage(1)
                }}
                className={cn(
                  'min-h-11 rounded-[3px] px-3 font-ui text-xs font-semibold transition-colors',
                  status === value
                    ? 'bg-primary text-white'
                    : 'text-charcoal hover:bg-charcoal-100',
                )}
              >
                {translate(t, `parties.filter.${value}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {parties.isError ? <Alert variant="error">{t('parties:loadError')}</Alert> : null}

      {parties.isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-10 shrink-0 rounded-pill" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="hidden h-4 w-20 md:block" />
                <Skeleton className="h-5 w-16 rounded-pill" />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {!parties.isLoading && !parties.isError && rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-pill bg-wood-100 text-primary">
            <ContactRound aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg font-bold text-charcoal">
              {filtered ? t('parties:emptyFilteredTitle') : t('parties:emptyTitle')}
            </p>
            <p className="mt-1 text-sm text-charcoal-500">
              {filtered ? t('parties:emptyFilteredBody') : t('parties:emptyBody')}
            </p>
          </div>
          {!filtered ? (
            <Button onClick={() => setFormOpen(true)}>
              <UserPlus aria-hidden="true" className="size-4" />
              {t('parties:add')}
            </Button>
          ) : null}
        </Card>
      ) : null}

      {rows.length > 0 ? (
        <Card
          className={cn(
            'overflow-hidden transition-opacity',
            parties.isFetching ? 'opacity-60' : '',
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 border-collapse text-left">
              <thead className="bg-canvas-alt">
                <tr className="font-ui text-[11px] uppercase tracking-wide text-charcoal-400">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('parties:columns.party')}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('parties:columns.type')}
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-semibold lg:table-cell">
                    {t('parties:columns.address')}
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    {t('parties:columns.status')}
                  </th>
                  <th scope="col" className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((party) => (
                  <PartyRow key={party.id} party={party} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {result && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            {t('parties:previous')}
          </Button>
          <span className="font-ui text-sm text-charcoal-500">
            {t('parties:pageOf', { page, total: totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            {t('parties:next')}
          </Button>
        </div>
      ) : null}

      <Modal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setFormError(undefined)
        }}
      >
        <ModalContent
          title={t('parties:addTitle')}
          description={t('parties:addSubtitle')}
          closeLabel={t('common:close')}
        >
          <PartyForm
            pending={create.isPending}
            error={formError}
            onSave={handleCreate}
            onCancel={() => {
              setFormOpen(false)
              setFormError(undefined)
            }}
            submitLabel={t('parties:create')}
          />
        </ModalContent>
      </Modal>

      <Modal open={typesOpen} onOpenChange={setTypesOpen}>
        <ModalContent
          title={t('parties:typesTitle')}
          description={t('parties:typesSubtitle')}
          closeLabel={t('common:close')}
        >
          <PartyTypeManager />
        </ModalContent>
      </Modal>
    </div>
  )
}

function PartyRow({ party }: { party: Party }) {
  const { t } = useTranslation('parties')
  const navigate = useNavigate()

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>): void {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(partyDetail(party.id))
  }

  return (
    <tr
      onClick={handleRowClick}
      className="group cursor-pointer transition-colors hover:bg-card-alt"
    >
      <td className="px-5 py-3">
        <Link
          to={partyDetail(party.id)}
          className="flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <PartyAvatar name={party.name} />
          <span className="min-w-0">
            <span className="block truncate font-ui text-sm font-semibold text-charcoal">
              {party.name}
            </span>
            <span className="mt-0.5 block truncate font-ui text-xs text-charcoal-400">
              {party.phone || t('noPhone')}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-5 py-3">
        <span className="rounded-pill bg-canvas-alt px-2 py-0.5 font-ui text-[10px] font-semibold text-charcoal-500">
          {party.party_type.name}
        </span>
      </td>
      <td className="hidden px-5 py-3 font-ui text-sm text-charcoal-500 lg:table-cell">
        {party.address || '—'}
      </td>
      <td className="px-5 py-3">
        <StatusBadge active={party.is_active} />
      </td>
      <td className="px-2 py-3 text-right">
        <Link
          to={partyDetail(party.id)}
          aria-label={t('view', { name: party.name })}
          className="inline-grid size-9 place-items-center rounded-sm text-charcoal-400 transition-all group-hover:translate-x-0.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </td>
    </tr>
  )
}

