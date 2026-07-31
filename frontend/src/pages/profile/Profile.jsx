import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getProfile } from "../../services/profileService";
  import Spinner from "../../components/common/Spinner";
function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);
  if (!profile) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">
          My Profile
        </h1>

        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        My Profile
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">

        <div>
          <strong>User ID:</strong> {profile.user_id}
        </div>

        <div>
          <strong>Full Name:</strong> {profile.full_name}
        </div>

        <div>
          <strong>Email:</strong> {profile.email}
        </div>

        <div>
          <strong>Role:</strong> {profile.role}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Profile;