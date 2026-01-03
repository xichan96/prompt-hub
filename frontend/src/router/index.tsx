import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login';
import { PublicRoute, RoleBasedRedirect, ProtectedRoute } from './guard';
import NoAuth from '@/pages/403';
import NotFound from '@/pages/404';
import { lazy, Suspense } from 'react';
import { PageLoading } from '@/components/Loading';
import AppLayout from '@/layout/AppLayout';

const Namespaces = lazy(() => import('@/pages/Namespaces'));
const NamespaceDetail = lazy(() => import('@/pages/NamespaceDetail'));
const PromptEditor = lazy(() => import('@/pages/PromptEditor'));
const Users = lazy(() => import('@/pages/Users'));
const Settings = lazy(() => import('@/pages/Settings'));

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <RoleBasedRedirect />,
      },
      {
        path: 'namespaces',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <AppLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoading />}>
                <Namespaces />
              </Suspense>
            ),
          },
          {
            path: ':namespaceId',
            element: (
              <Suspense fallback={<PageLoading />}>
                <NamespaceDetail />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'namespaces/:namespaceId/prompts/:promptId/edit',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <PromptEditor />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoading />}>
              <AppLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoading />}>
                <Users />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoading />}>
              <AppLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoading />}>
                <Settings />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/403',
    element: <NoAuth />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

