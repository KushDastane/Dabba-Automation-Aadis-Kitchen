import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";

import { FiChevronRight, FiUsers } from "react-icons/fi";
import { HiOutlinePhone } from "react-icons/hi";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setStudents(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-20 text-gray-400 animate-pulse">
        Loading students…
      </p>
    );
  }

  if (students.length === 0) {
    return (
      <p className="text-center mt-20 text-gray-400">No students registered</p>
    );
  }

  return (
    <div className="pb-24 bg-[#faf9f6] min-h-screen px-4">
      <PageHeader name="Students" />

      {/* STATS STRIP */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2 bg-[#fff3d6] text-[#8a5b00] px-4 py-1.5 rounded-full text-sm font-medium">
          <FiUsers className="text-base" />
          {students.length} Students
        </div>
      </div>

      {/* STUDENT LIST */}
      <div className="space-y-3">
        {students.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(`/students/${s.id}`)}
            className="
              group bg-white rounded-2xl p-4
              flex justify-between items-center
              cursor-pointer
              transition-all duration-200 ease-out
              hover:shadow-md hover:-translate-y-[1px]
              active:scale-[0.99]
            "
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* AVATAR */}
              <div
                className="
                  w-11 h-11 rounded-full
                  bg-[#fff1c2] text-[#8a5b00]
                  flex items-center justify-center
                  font-semibold text-lg
                  transition-colors
                  group-hover:bg-[#fde68a]
                "
              >
                {s.name?.charAt(0) || "S"}
              </div>

              {/* INFO */}
              <div>
                <p className="font-medium text-gray-900 leading-tight">
                  {s.name || "Unnamed Student"}
                </p>

                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <HiOutlinePhone className="text-sm" />
                  {s.phone || "No phone"}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 text-[#8a5b00] font-medium text-sm">
              <span className="hidden sm:inline">View</span>
              <FiChevronRight
                className="
                  text-lg
                  transition-transform duration-200
                  group-hover:translate-x-1
                "
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
