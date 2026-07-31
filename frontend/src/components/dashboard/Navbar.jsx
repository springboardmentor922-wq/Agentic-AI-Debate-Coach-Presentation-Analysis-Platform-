import { useEffect, useState } from "react";
import { getProfile } from "../../services/authService";

function Navbar() {
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

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>
      </div>

      <div className="text-right">
        {profile ? (
          <>
            <p className="font-semibold">
              {profile.full_name}
            </p>

            <p className="text-sm text-gray-500">
              {profile.role}
            </p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </header>
  );
}

export default Navbar;