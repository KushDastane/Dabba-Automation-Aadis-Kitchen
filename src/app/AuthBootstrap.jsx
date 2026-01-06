import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createUserIfNotExists } from "../services/userService";

export default function AuthBootstrap({ children }) {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserIfNotExists(user); // default role = student
      }
    });

    return () => unsub();
  }, []);

  return children;
}
