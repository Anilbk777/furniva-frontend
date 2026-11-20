export interface OrganizationDetails {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateOrganizationInput {
  name: string
}

export interface UpdateOrganizationInput {
  name: string
}
