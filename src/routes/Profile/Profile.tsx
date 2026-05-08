import { Outlet } from 'react-router';

import { useAppRoutes } from '@/hooks/useAppRoutes';

const Profile = () => {
  const { profileRoutes } = useAppRoutes();
  return (
    <div data-testid="profile-route">
      <Outlet context={profileRoutes} />
    </div>
  );
};

export default Profile;
