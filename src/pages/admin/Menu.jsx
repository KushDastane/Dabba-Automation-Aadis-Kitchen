import { useState, useEffect } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { db } from "../../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getTodayKey, getMenuForDate } from "../../services/menuService";
import { FaPencilAlt, FaPen } from "react-icons/fa";
const OTHER_SUGGESTIONS = ["Misal Pav", "Pav Bhaji", "Thalipeeth"];
const FULL_ADDON_SUGGESTIONS = ["Dal Rice", "Kadhi Rice", "Biryani"];
const FREE_ADDONS = ["Chatni", "Pickle", "Dahi", "Sweet"];

export default function Menu() {
  // 🔹 NEW (meal slot)
  const [mealSlot, setMealSlot] = useState("lunch"); // lunch | dinner

  const [date, setDate] = useState(getTodayKey());
  const [type, setType] = useState(""); // ROTI_SABZI | OTHER

  // View mode: 'summary' or 'edit'
  const [viewMode, setViewMode] = useState("summary");
  const [editingSlot, setEditingSlot] = useState(null); // which slot is being edited

  // Today's menu data for summary view
  const [todayMenuData, setTodayMenuData] = useState(null);

  // Roti–Sabzi
  const [sabzi, setSabzi] = useState("");
  const [halfPrice, setHalfPrice] = useState(50);
  const [fullPrice, setFullPrice] = useState(80);

  const [fullAddon, setFullAddon] = useState("");
  const [showCustomAddon, setShowCustomAddon] = useState(false);
  const [customFullAddon, setCustomFullAddon] = useState("");

  const [freeAddons, setFreeAddons] = useState([]);

  // Other meal
  const [otherName, setOtherName] = useState("");
  const [otherPrice, setOtherPrice] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Extras
  const [extras, setExtras] = useState([{ name: "Roti", price: 7 }]);

  // Load today's menu data for summary view
  useEffect(() => {
    const loadTodayMenu = async () => {
      const todayKey = getTodayKey();
      const menuData = await getMenuForDate(todayKey);
      setTodayMenuData(menuData);
    };

    loadTodayMenu();
  }, []);

  // Load existing menu data when date or meal slot changes (for edit mode)
  useEffect(() => {
    if (viewMode === "edit" && editingSlot) {
      const loadMenu = async () => {
        const menuData = await getMenuForDate(date);
        if (menuData && menuData[editingSlot]) {
          const menu = menuData[editingSlot];
          setType(menu.type || "");

          if (menu.type === "ROTI_SABZI" && menu.rotiSabzi) {
            setSabzi(menu.rotiSabzi.sabzi || "");
            setHalfPrice(menu.rotiSabzi.half?.price || 50);
            setFullPrice(menu.rotiSabzi.full?.price || 80);
            setFreeAddons(menu.rotiSabzi.freeAddons || []);

            // Try to extract full addon from items
            const fullItems = menu.rotiSabzi.full?.items || [];
            const addonItem = fullItems.find(
              (item) => !item.includes("Chapati") && !item.includes("Sabzi")
            );
            if (addonItem) {
              if (FULL_ADDON_SUGGESTIONS.includes(addonItem)) {
                setFullAddon(addonItem);
                setCustomFullAddon("");
                setShowCustomAddon(false);
              } else {
                setFullAddon("");
                setCustomFullAddon(addonItem);
                setShowCustomAddon(true);
              }
            }
          } else if (menu.type === "OTHER" && menu.other) {
            setOtherName(menu.other.name || "");
            setOtherPrice(menu.other.price || "");
            setShowOtherInput(!OTHER_SUGGESTIONS.includes(menu.other.name));
          }

          setExtras(
            menu.extras?.length > 0 ? menu.extras : [{ name: "Roti", price: 7 }]
          );
        } else {
          // Reset to defaults if no menu exists
          setType("");
          setSabzi("");
          setHalfPrice(50);
          setFullPrice(80);
          setFullAddon("");
          setCustomFullAddon("");
          setShowCustomAddon(false);
          setFreeAddons([]);
          setOtherName("");
          setOtherPrice("");
          setShowOtherInput(false);
          setExtras([{ name: "Roti", price: 7 }]);
        }
      };

      loadMenu();
    }
  }, [date, editingSlot, viewMode]);

  const toggleFreeAddon = (addon) => {
    setFreeAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const addExtraRow = () => {
    setExtras([...extras, { name: "", price: "" }]);
  };

  const updateExtra = (i, key, value) => {
    const copy = [...extras];
    copy[i][key] = value;
    setExtras(copy);
  };

  const removeExtra = (i) => {
    setExtras(extras.filter((_, idx) => idx !== i));
  };

  const saveMenu = async () => {
    if (!type) {
      alert("Select menu type");
      return;
    }

    const payload = {
      type,
      extras: extras.filter((e) => e.name && e.price),
      updatedAt: serverTimestamp(),
    };

    if (type === "ROTI_SABZI") {
      payload.rotiSabzi = {
        sabzi,
        half: {
          items: ["4 Chapati", sabzi && `${sabzi} Sabzi`].filter(Boolean),
          price: Number(halfPrice),
        },
        full: {
          items: [
            "4 Chapati",
            sabzi && `${sabzi} Sabzi`,
            fullAddon || customFullAddon,
          ].filter(Boolean),
          price: Number(fullPrice),
        },
        freeAddons,
      };
    }

    if (type === "OTHER") {
      if (!otherName || !otherPrice) {
        alert("Enter item name and price");
        return;
      }

      payload.other = {
        name: otherName,
        price: Number(otherPrice),
      };
    }

    // 🔹 CHANGED: save under lunch/dinner
    await setDoc(
      doc(db, "menus", date),
      {
        [mealSlot]: payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Refresh today's menu data and go back to summary view
    const todayKey = getTodayKey();
    const menuData = await getMenuForDate(todayKey);
    setTodayMenuData(menuData);
    setViewMode("summary");
    setEditingSlot(null);

    alert(`${mealSlot === "lunch" ? "Lunch" : "Dinner"} menu saved`);
  };

  const startEditing = (slot) => {
    setEditingSlot(slot);
    setMealSlot(slot);
    setDate(getTodayKey());
    setViewMode("edit");
  };

  const cancelEditing = () => {
    setViewMode("summary");
    setEditingSlot(null);
  };

  // Helper function to get menu summary
  const getMenuSummary = (slot) => {
    if (!todayMenuData || !todayMenuData[slot]) return null;

    const menu = todayMenuData[slot];
    if (menu.type === "ROTI_SABZI" && menu.rotiSabzi) {
      const halfItems = menu.rotiSabzi.half?.items || [];
      const fullItems = menu.rotiSabzi.full?.items || [];
      return {
        type: "Roti – Sabzi",
        half: {
          items: halfItems.join(", "),
          price: `₹${menu.rotiSabzi.half?.price || 0}`,
        },
        full: {
          items: fullItems.join(", "),
          price: `₹${menu.rotiSabzi.full?.price || 0}`,
        },
      };
    } else if (menu.type === "OTHER" && menu.other) {
      return {
        type: "Other",
        name: menu.other.name,
        price: `₹${menu.other.price || 0}`,
      };
    }
    return null;
  };

  if (viewMode === "summary") {
   return (
     <div className="pt-7 px-6 pb-24">
       <PageHeader name="Today's Menu" />

       <div className="mt-8 space-y-8">
         {/* LUNCH */}
         <div className="relative">
           {/* Accent */}
           <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-yellow-300" />

           {getMenuSummary("lunch") ? (
             <div className="ml-4 rounded-3xl bg-white/70 backdrop-blur-md p-6 ring-1 ring-black/5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <span className="text-xs font-semibold tracking-wide text-yellow-700">
                     LUNCH
                   </span>
                   <h3 className="text-lg font-semibold text-gray-900">
                     Lunch Menu
                   </h3>
                 </div>

                 <button
                   onClick={() => startEditing("lunch")}
                   className="p-2 rounded-xl bg-yellow-100 hover:bg-yellow-200 transition"
                   title="Edit Lunch Menu"
                 >
                   <FaPen className="text-yellow-800 text-sm" />
                 </button>
               </div>

               <div className="space-y-2 text-sm text-gray-700">
                 {getMenuSummary("lunch").type === "Roti – Sabzi" ? (
                   <>
                     <div className="flex items-center justify-between">
                       <span className="font-medium text-gray-800">
                         Half Dabba
                       </span>
                       <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                         {getMenuSummary("lunch").half.price}
                       </span>
                     </div>
                     <p className="text-xs text-gray-500">
                       {getMenuSummary("lunch").half.items}
                     </p>

                     <div className="flex items-center justify-between pt-2">
                       <span className="font-medium text-gray-800">
                         Full Dabba
                       </span>
                       <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                         {getMenuSummary("lunch").full.price}
                       </span>
                     </div>
                     <p className="text-xs text-gray-500">
                       {getMenuSummary("lunch").full.items}
                     </p>
                   </>
                 ) : (
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-gray-800">
                       {getMenuSummary("lunch").name}
                     </span>
                     <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                       {getMenuSummary("lunch").price}
                     </span>
                   </div>
                 )}
               </div>
             </div>
           ) : (
             <div className="ml-4 rounded-3xl bg-gray-50/70 p-6 ring-1 ring-dashed ring-black/10">
               <div className="flex items-center justify-between">
                 <div>
                   <span className="text-xs font-semibold tracking-wide text-yellow-700">
                     LUNCH
                   </span>
                   <h3 className="text-lg font-semibold text-gray-800">
                     Lunch Menu
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">Not set yet</p>
                 </div>

                 <button
                   onClick={() => startEditing("lunch")}
                   className="rounded-xl bg-yellow-100 px-5 py-2.5 text-sm font-medium
                           text-yellow-900 hover:bg-yellow-200 transition"
                 >
                   Set Menu
                 </button>
               </div>
             </div>
           )}
         </div>

         {/* DINNER */}
         <div className="relative">
           {/* Accent */}
           <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-amber-400" />

           {getMenuSummary("dinner") ? (
             <div className="ml-4 rounded-3xl bg-white/70 backdrop-blur-md p-6 ring-1 ring-black/5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <span className="text-xs font-semibold tracking-wide text-amber-700">
                     DINNER
                   </span>
                   <h3 className="text-lg font-semibold text-gray-900">
                     Dinner Menu
                   </h3>
                 </div>

                 <button
                   onClick={() => startEditing("dinner")}
                   className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 transition"
                   title="Edit Dinner Menu"
                 >
                   <FaPen className="text-amber-800 text-sm" />
                 </button>
               </div>

               <div className="space-y-2 text-sm text-gray-700">
                 {getMenuSummary("dinner").type === "Roti – Sabzi" ? (
                   <>
                     <div className="flex items-center justify-between">
                       <span className="font-medium text-gray-800">
                         Half Dabba
                       </span>
                       <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                         {getMenuSummary("dinner").half.price}
                       </span>
                     </div>
                     <p className="text-xs text-gray-500">
                       {getMenuSummary("dinner").half.items}
                     </p>

                     <div className="flex items-center justify-between pt-2">
                       <span className="font-medium text-gray-800">
                         Full Dabba
                       </span>
                       <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                         {getMenuSummary("dinner").full.price}
                       </span>
                     </div>
                     <p className="text-xs text-gray-500">
                       {getMenuSummary("dinner").full.items}
                     </p>
                   </>
                 ) : (
                   <div className="flex items-center justify-between">
                     <span className="font-medium text-gray-800">
                       {getMenuSummary("dinner").name}
                     </span>
                     <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                       {getMenuSummary("dinner").price}
                     </span>
                   </div>
                 )}
               </div>
             </div>
           ) : (
             <div className="ml-4 rounded-3xl bg-gray-50/70 p-6 ring-1 ring-dashed ring-black/10">
               <div className="flex items-center justify-between">
                 <div>
                   <span className="text-xs font-semibold tracking-wide text-amber-700">
                     DINNER
                   </span>
                   <h3 className="text-lg font-semibold text-gray-800">
                     Dinner Menu
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">Not set yet</p>
                 </div>

                 <button
                   onClick={() => startEditing("dinner")}
                   className="rounded-xl bg-amber-100 px-5 py-2.5 text-sm font-medium
                           text-amber-900 hover:bg-amber-200 transition"
                 >
                   Set Menu
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   );


  }

  // Edit mode
  return (
    <div className="pb-24 pt-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={cancelEditing}
          className="text-yellow-700 cursor-pointer transition hover:text-yellow-900 flex items-center gap-2 transition-colors"
        >
          ← Back to Summary
        </button>
      </div>

      {/* Meal Type */}
      <div className="mb-5 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
          MEAL TYPE
        </h4>

        <div className="flex gap-3 ">
          {[
            { label: "Roti – Sabzi", value: "ROTI_SABZI" },
            { label: "Other", value: "OTHER" },
          ].map((opt) => {
            const active = type === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`flex-1 py-4 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer
            ${
              active
                ? "bg-yellow-100 text-yellow-900 ring-2 ring-yellow-300 shadow-inner"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }
          `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ROTI SABZI */}
      {type === "ROTI_SABZI" && (
        <>
          {/* SABZI */}
          <div className="mb-5 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 tracking-wide">
              SABZI
            </h4>

            <input
              placeholder="e.g. Gobi"
              value={sabzi}
              onChange={(e) => setSabzi(e.target.value)}
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800
                 ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300 outline-none
                 transition"
            />
          </div>

          {/* HALF DABBA */}
          <div className="mb-5 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-1 tracking-wide">
              HALF DABBA
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              4 Chapati + {sabzi || "Sabzi"}
            </p>

            <input
              type="number"
              value={halfPrice}
              onChange={(e) => setHalfPrice(e.target.value)}
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800
                 ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300 outline-none
                 transition"
            />
          </div>

          {/* FULL DABBA */}
          <div className="mb-5 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-1 tracking-wide">
              FULL DABBA
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              4 Chapati + {sabzi || "Sabzi"}
            </p>

            {/* ADD-ONS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {FULL_ADDON_SUGGESTIONS.map((a) => {
                const active = fullAddon === a;
                return (
                  <button
                    key={a}
                    onClick={() => {
                      setFullAddon(a);
                      setCustomFullAddon("");
                      setShowCustomAddon(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
              ${
                active
                  ? "bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
                  >
                    + {a}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setFullAddon("");
                  setShowCustomAddon(true);
                }}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200
                   text-sm font-medium transition"
              >
                + Other
              </button>
            </div>

            {showCustomAddon && (
              <input
                placeholder="Other item"
                value={customFullAddon}
                onChange={(e) => setCustomFullAddon(e.target.value)}
                className="mb-4 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm
                   ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                   outline-none transition"
              />
            )}

            <input
              type="number"
              value={fullPrice}
              onChange={(e) => setFullPrice(e.target.value)}
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800
                 ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300 outline-none
                 transition"
            />
          </div>

          {/* FREE ADD-ONS */}
          <div className="mb-5 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
              FREE ADD-ONS
            </h4>

            <div className="flex flex-wrap gap-2">
              {FREE_ADDONS.map((a) => {
                const active = freeAddons.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleFreeAddon(a)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
              ${
                active
                  ? "bg-yellow-100 text-yellow-900 ring-2 ring-yellow-300"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* OTHER */}
      {type === "OTHER" && (
        <div className="mb-5 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
            OTHER MEAL
          </h4>

          {/* SUGGESTIONS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {OTHER_SUGGESTIONS.map((o) => {
              const active = otherName === o;

              return (
                <button
                  key={o}
                  onClick={() => {
                    setOtherName(o);
                    setShowOtherInput(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                active
                  ? "bg-yellow-100 text-yellow-900 ring-2 ring-yellow-300"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
                >
                  {o}
                </button>
              );
            })}

            <button
              onClick={() => {
                setOtherName("");
                setShowOtherInput(true);
              }}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200
                   text-sm font-medium transition"
            >
              + Other
            </button>
          </div>

          {/* CUSTOM ITEM */}
          {showOtherInput && (
            <input
              placeholder="Item name"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              className="mb-4 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm
                   ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                   outline-none transition"
            />
          )}

          {/* PRICE */}
          <input
            type="number"
            placeholder="Price"
            value={otherPrice}
            onChange={(e) => setOtherPrice(e.target.value)}
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm
                 ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                 outline-none transition"
          />
        </div>
      )}

      {/* EXTRAS */}
      {type && (
        <div className="mb-6 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
            EXTRAS
          </h4>

          {extras.map((e, i) => (
            <div
              key={i}
              className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              {/* ITEM NAME */}
              <input
                placeholder="Item"
                value={e.name}
                onChange={(ev) => updateExtra(i, "name", ev.target.value)}
                className="flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm
                     ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                     outline-none transition"
              />

              {/* PRICE + REMOVE */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price"
                  value={e.price}
                  onChange={(ev) => updateExtra(i, "price", ev.target.value)}
                  className="w-28 rounded-2xl bg-gray-50 px-4 py-3 text-sm
                       ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                       outline-none transition"
                />

                <button
                  onClick={() => removeExtra(i)}
                  className="flex items-center justify-center rounded-2xl
                       bg-red-100 text-red-700 hover:bg-red-200
                       px-4 py-3 transition"
                  title="Remove extra"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* ADD EXTRA */}
          <button
            onClick={addExtraRow}
            className="mt-2 inline-flex items-center gap-2 rounded-xl
                 bg-yellow-100 px-4 py-2 text-sm font-medium
                 text-yellow-900 hover:bg-yellow-200 transition cursor-pointer"
          >
            + Add Extra
          </button>
        </div>
      )}

      {/* SAVE BUTTON */}
      <div className="mt-10 mb-1 ">
        <button
          onClick={saveMenu}
          className="
      w-full rounded-2xl
      bg-yellow-600 hover:bg-yellow-700
      text-white py-4 text-base font-semibold
      shadow-sm transition cursor-pointer
    "
        >
          Save {mealSlot === "lunch" ? "Lunch" : "Dinner"} Menu
        </button>
      </div>
    </div>
  );
}
