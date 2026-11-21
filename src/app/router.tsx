import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppShell } from 'src/components/layout/AppShell'
import { AuthLayout } from 'src/components/layout/AuthLayout'
import {
  ChangePasswordPage,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  RequireAuth,
  RequirePasswordSet,
  ResetPasswordPage,
  VerifyEmailPage,
} from 'src/features/auth'
import {
  AttendancePage,
  EmployeeAttendancePage,
} from 'src/features/attendance'
import { DashboardPage } from 'src/features/dashboard'
import { EmployeeDetailPage, EmployeesPage } from 'src/features/employees'
import { PartiesPage, PartyDetailPage } from 'src/features/parties'
import {
  OrganizationPage,
  OrganizationSetupPage,
  RequireOrganization,
} from 'src/features/organization'
import { SessionRedirectSync } from 'src/app/SessionRedirectSync'
import { paths } from 'src/lib/paths'

export const router = createBrowserRouter([
  {
    element: <SessionRedirectSync />,
    children: [
      { path: paths.root, element: <Navigate to={paths.login} replace /> },
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
          { path: paths.verifyEmail, element: <VerifyEmailPage /> },
          { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
          { path: paths.resetPassword, element: <ResetPasswordPage /> },
          {
            element: <RequireAuth />,
            children: [{ path: paths.changePassword, element: <ChangePasswordPage /> }],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequirePasswordSet />,
            children: [
              { path: paths.organizationSetup, element: <OrganizationSetupPage /> },
              {
                element: <RequireOrganization />,
                children: [
                  {
                    element: <AppShell />,
                    children: [
                      { path: paths.dashboard, element: <DashboardPage /> },
                      { path: paths.employees, element: <EmployeesPage /> },
                      {
                        path: `${paths.employees}/:employeeId`,
                        element: <EmployeeDetailPage />,
                      },
                      { path: paths.attendance, element: <AttendancePage /> },
                      {
                        path: `${paths.attendance}/:employeeId`,
                        element: <EmployeeAttendancePage />,
                      },
                      { path: paths.parties, element: <PartiesPage /> },
                      {
                        path: `${paths.parties}/:partyId`,
                        element: <PartyDetailPage />,
                      },
                      { path: paths.organization, element: <OrganizationPage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={paths.login} replace /> },
    ],
  },
])
