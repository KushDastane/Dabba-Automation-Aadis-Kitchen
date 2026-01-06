import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [userId]);

  return notifications;
};
