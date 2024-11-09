import { ReactNode, FC } from 'react';
import { useRecoilValue } from 'recoil';
import { userState, isLoadingState } from './state/userState';
import { Navigate } from 'react-router-dom';
import Spinner from './components/spinner';

interface RouteProps {
  element: ReactNode;
}

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
}

const LoadingWrapper: FC<LoadingWrapperProps> = ({ isLoading, children }) => (
  isLoading ? <Spinner /> : <>{children}</>
);

export const PrivateRoute: FC<RouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  return (
    <LoadingWrapper isLoading={isLoading}>
      {user ? <>{element}</> : <Navigate to="/signin" />}
    </LoadingWrapper>
  );
};

export const PublicRoute: FC<RouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  return (
    <LoadingWrapper isLoading={isLoading}>
      {user ? <Navigate to="/" /> : <>{element}</>}
    </LoadingWrapper>
  );
};

export const SubscriptionPrivateRoute: FC<RouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  return (
    <LoadingWrapper isLoading={isLoading}>
      {!user ? <Navigate to="/signin" /> : 
      user.Subscription && user.Subscription.length > 0 ? <>{element}</> : <Navigate to="/" />}
    </LoadingWrapper>
  );
};

export const SubscriptionPublicRoute: FC<RouteProps> = ({ element }) => {
  const user = useRecoilValue(userState);
  const isLoading = useRecoilValue(isLoadingState);

  return (
    <LoadingWrapper isLoading={isLoading}>
      {user && user.Subscription && user.Subscription.length > 0 ? <Navigate to="/dashboard" /> : <>{element}</>}
    </LoadingWrapper>
  );
};
