import { http } from 'src/lib/http'
import type { ApiResponse } from 'src/types/api'
import type {
  CreateOrganizationInput,
  OrganizationDetails,
  UpdateOrganizationInput,
} from 'src/features/organization/types'

export function createOrganization(
  input: CreateOrganizationInput,
): Promise<ApiResponse<OrganizationDetails>> {
  return http.post<ApiResponse<OrganizationDetails>>('/organizations', input).then((r) => r.data)
}

export function getOrganization(): Promise<ApiResponse<OrganizationDetails>> {
  return http.get<ApiResponse<OrganizationDetails>>('/organizations').then((r) => r.data)
}

export function updateOrganization(
  input: UpdateOrganizationInput,
): Promise<ApiResponse<OrganizationDetails>> {
  return http.patch<ApiResponse<OrganizationDetails>>('/organizations', input).then((r) => r.data)
}
