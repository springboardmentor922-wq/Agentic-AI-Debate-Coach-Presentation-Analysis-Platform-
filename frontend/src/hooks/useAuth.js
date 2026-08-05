import { useContext } from "react";

import { AuthContext } from "../context/authContext.js";

export const useAuth = () => useContext(AuthContext);