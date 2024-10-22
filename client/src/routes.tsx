import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { userState, isLoadingState } from './state/userState';
import { Navigate } from 'react-router-dom';
import Spinner from './components/spinner';

interface PrivateRouteProps {
  element: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  if (isLoading) {
    return <Spinner />;
  }

  return user ? <>{element}</> : <Navigate to="/signin" />;
};

interface PublicRouteProps {
  element: ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  if (isLoading) {
    return <Spinner />;
  }

  return user ? <Navigate to="/" /> : <>{element}</>;
};

export const SubscriptionPrivateRoutes: React.FC<PrivateRouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  if (isLoading) {
    return <Spinner />;
  }
  if (!user) return <Navigate to="/signin" />;
  if (user && (!user.Subscription || user.Subscription.length === 0)) {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export const SubscriptionPublicRoutes: React.FC<PublicRouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  if (isLoading) {
    return <Spinner />;
  }
  if (!user || (user && (!user.Subscription || user.Subscription.length === 0))) {
    return <>{element}</>;
  }
  
  return <Navigate to='/dashboard' />;
};

