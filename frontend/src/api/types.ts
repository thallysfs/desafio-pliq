export type SurveyType = 'NPS' | 'CSAT'

export interface Contact {
  id: number
  name: string
  email: string
  segment: string | null
}

export interface ContactInput {
  name: string
  email: string
  segment: string | null
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ContactsQuery {
  search?: string
  page?: number
  pageSize?: number
}

export interface ClassBucket {
  count: number
  pct: number
}

export interface Summary {
  npsScore: number
  npsResponses: number
  promoters: ClassBucket
  neutrals: ClassBucket
  detractors: ClassBucket
  responsesCount: number
  csatAvg: number | null
}

export interface ContactResponse {
  id: number
  surveyId: number
  surveyName: string
  surveyType: SurveyType
  score: number
  comment: string | null
  channel: string
  respondedAt: string
}
