// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button, Badge, Card, CardBody } from '../design-system';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 pb-safe-area sm:bg-gray-100 sm:justify-center sm:items-center">
      <div className="flex-grow flex items-center justify-center p-4 sm:p-0">
        <div className="w-full sm:max-w-md">
          <Card variant="bottom-sheet" noPadding>
            <CardBody className="p-6 sm:p-8 text-center border-t sm:border-0 border-gray-100">
              <div className="relative mx-auto mb-6">
                <div className="absolute inset-0 bg-system-error/20 rounded-full blur-xl transform animate-pulse"></div>
                <div className="relative mx-auto flex items-center justify-center h-24 w-24 rounded-[24px] bg-red-50 border border-red-100 shadow-sm">
                  <svg className="h-10 w-10 text-system-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              <Badge variant="subtle" colorScheme="error" className="mb-3 mx-auto px-3 py-1 text-xs font-bold rounded-full">Error 404</Badge>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Page Not Found</h2>

              <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
                The page you're looking for doesn't exist or has been moved. Check the URL or return home.
              </p>

              <div className="space-y-3">
                <Link to="/" className="block">
                  <Button variant="primary" size="lg" fullWidth className="h-14 rounded-2xl shadow-sm text-[16px] font-bold">
                    Go to Home
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="outline" size="lg" fullWidth className="h-14 rounded-2xl text-[16px] font-semibold border-2 hover:bg-gray-50">
                    Go to Login
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/support" className="px-4 py-2 text-sm font-semibold bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                    Contact Support
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
