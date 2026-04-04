// src/pages/ForbiddenPage.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Button, Badge, Card, CardBody } from '../design-system';

export const ForbiddenPage = () => {
  const { authState, logout } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 pb-safe-area sm:bg-gray-100 sm:justify-center sm:items-center">
      <div className="flex-grow flex items-center justify-center p-4 sm:p-0">
        <div className="w-full sm:max-w-md">
          <Card variant="bottom-sheet" noPadding>
            <CardBody className="p-6 sm:p-8 text-center border-t sm:border-0 border-gray-100">
              <div className="relative mx-auto mb-6">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl transform animate-pulse"></div>
                <div className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-[24px] bg-yellow-50 border border-yellow-100 shadow-sm">
                  <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              <Badge variant="subtle" colorScheme="warning" className="mb-3 mx-auto px-3 py-1 text-xs font-bold rounded-full">Error 403</Badge>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Access Forbidden</h2>

              <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>

              <div className="space-y-3">
                {authState.dashboardUrl && (
                  <Link to={authState.dashboardUrl} className="block">
                    <Button variant="primary" size="lg" fullWidth className="h-14 rounded-2xl shadow-sm text-[16px] font-bold">
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="h-14 rounded-2xl text-[16px] font-semibold border-2 text-system-error hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href="https://wa.me/+233548983019"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +233 54 898 3019
                  </a>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
