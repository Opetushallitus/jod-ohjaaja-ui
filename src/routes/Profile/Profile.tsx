import { useAppRoutes } from '@/hooks/useAppRoutes';
import { Outlet } from 'react-router';

const Profile = () => {
  const { profileRoutes } = useAppRoutes();
  return (
    <div data-testid="profile-route">
      <Outlet context={profileRoutes} />
    </div>
  );
};

export default Profile;
