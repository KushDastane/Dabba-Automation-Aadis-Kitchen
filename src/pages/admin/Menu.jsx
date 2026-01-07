import { useState, useEffect } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { db } from "../../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getTodayKey, getMenuForDate } from "../../services/menuService";

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
      const sabzi = menu.rotiSabzi.sabzi;
      const fullItems = menu.rotiSabzi.full?.items || [];
      const addon = fullItems.find(
        (item) => !item.includes("Chapati") && !item.includes("Sabzi")
      );
      return {
        type: "Roti – Sabzi",
        main: `${sabzi} Sabzi`,
        addon: addon ? `+ ${addon}` : "",
        price: `₹${menu.rotiSabzi.full?.price || 0}`,
      };
    } else if (menu.type === "OTHER" && menu.other) {
      return {
        type: "Other",
        main: menu.other.name,
        addon: "",
        price: `₹${menu.other.price || 0}`,
      };
    }
    return null;
  };

  if (viewMode === "summary") {
    return (
      <div className="pb-24">
        <PageHeader name="Today's Menu" />

        <div className="space-y-4">
          {/* Lunch Card */}
          {getMenuSummary("lunch") ? (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Lunch Menu</h3>
                <button
                  onClick={() => startEditing("lunch")}
                  className="text-blue-600 p-1"
                >
                  ✏️
                </button>
              </div>
              <div className="text-gray-700">
                <p className="font-medium">{getMenuSummary("lunch").main}</p>
                {getMenuSummary("lunch").addon && (
                  <p className="text-sm text-gray-600">
                    {getMenuSummary("lunch").addon}
                  </p>
                )}
                <p className="text-sm font-medium text-green-600 mt-1">
                  Full: {getMenuSummary("lunch").price}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-gray-700">
                    Lunch Menu
                  </h3>
                  <p className="text-gray-500 text-sm">Not set yet</p>
                </div>
                <button
                  onClick={() => startEditing("lunch")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Set Menu
                </button>
              </div>
            </div>
          )}

          {/* Dinner Card */}
          {getMenuSummary("dinner") ? (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">Dinner Menu</h3>
                <button
                  onClick={() => startEditing("dinner")}
                  className="text-blue-600 p-1"
                >
                  ✏️
                </button>
              </div>
              <div className="text-gray-700">
                <p className="font-medium">{getMenuSummary("dinner").main}</p>
                {getMenuSummary("dinner").addon && (
                  <p className="text-sm text-gray-600">
                    {getMenuSummary("dinner").addon}
                  </p>
                )}
                <p className="text-sm font-medium text-green-600 mt-1">
                  Full: {getMenuSummary("dinner").price}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-gray-700">
                    Dinner Menu
                  </h3>
                  <p className="text-gray-500 text-sm">Not set yet</p>
                </div>
                <button
                  onClick={() => startEditing("dinner")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Set Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={cancelEditing}
          className="text-blue-600 flex items-center gap-2"
        >
          ← Back to Summary
        </button>
        <h2 className="font-semibold text-lg">
          Edit {mealSlot === "lunch" ? "Lunch" : "Dinner"} Menu
        </h2>
      </div>

      {/* Meal Type */}
      <div className="flex gap-3 mb-4">
        {[
          { label: "Roti – Sabzi", value: "ROTI_SABZI" },
          { label: "Other", value: "OTHER" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setType(opt.value)}
            className={`flex-1 py-2 rounded-lg ${
              type === opt.value ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ROTI SABZI */}
      {type === "ROTI_SABZI" && (
        <>
          <div className="bg-white p-4 rounded-xl mb-4">
            <h4 className="font-medium mb-2">Sabzi</h4>
            <input
              placeholder="e.g. Gobi"
              value={sabzi}
              onChange={(e) => setSabzi(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="bg-white p-4 rounded-xl mb-4">
            <h4 className="font-medium">Half Dabba</h4>
            <p className="text-sm text-gray-500">
              4 Chapati + {sabzi || "Sabzi"}
            </p>
            <input
              type="number"
              value={halfPrice}
              onChange={(e) => setHalfPrice(e.target.value)}
              className="border p-2 rounded-lg w-full mt-2"
            />
          </div>

          <div className="bg-white p-4 rounded-xl mb-4">
            <h4 className="font-medium mb-1">Full Dabba</h4>
            <p className="text-sm text-gray-500 mb-2">
              4 Chapati + {sabzi || "Sabzi"}
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
              {FULL_ADDON_SUGGESTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setFullAddon(a);
                    setCustomFullAddon("");
                    setShowCustomAddon(false);
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    fullAddon === a ? "bg-green-600 text-white" : "bg-gray-100"
                  }`}
                >
                  + {a}
                </button>
              ))}
              <button
                onClick={() => {
                  setFullAddon("");
                  setShowCustomAddon(true);
                }}
                className="px-3 py-1 rounded-full bg-gray-200 text-sm"
              >
                + Other
              </button>
            </div>

            {showCustomAddon && (
              <input
                placeholder="Other item"
                value={customFullAddon}
                onChange={(e) => setCustomFullAddon(e.target.value)}
                className="border p-2 rounded-lg w-full mb-2"
              />
            )}

            <input
              type="number"
              value={fullPrice}
              onChange={(e) => setFullPrice(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="bg-white p-4 rounded-xl mb-4">
            <h4 className="font-medium mb-2">Free Add-ons</h4>
            <div className="flex flex-wrap gap-2">
              {FREE_ADDONS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleFreeAddon(a)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    freeAddons.includes(a)
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* OTHER */}
      {type === "OTHER" && (
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {OTHER_SUGGESTIONS.map((o) => (
              <button
                key={o}
                onClick={() => {
                  setOtherName(o);
                  setShowOtherInput(false);
                }}
                className={`px-3 py-1 rounded-full ${
                  otherName === o ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                {o}
              </button>
            ))}
            <button
              onClick={() => {
                setOtherName("");
                setShowOtherInput(true);
              }}
              className="px-3 py-1 rounded-full bg-gray-200"
            >
              Other
            </button>
          </div>

          {showOtherInput && (
            <input
              placeholder="Item name"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              className="border p-2 rounded-lg w-full mb-2"
            />
          )}

          <input
            type="number"
            placeholder="Price"
            value={otherPrice}
            onChange={(e) => setOtherPrice(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />
        </div>
      )}

      {/* EXTRAS */}
      {type && (
        <div className="bg-white p-4 rounded-xl mb-6">
          <h4 className="font-medium mb-2">Extras</h4>
          {extras.map((e, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Item"
                value={e.name}
                onChange={(ev) => updateExtra(i, "name", ev.target.value)}
                className="border p-2 rounded-lg w-1/2"
              />
              <input
                type="number"
                placeholder="Price"
                value={e.price}
                onChange={(ev) => updateExtra(i, "price", ev.target.value)}
                className="border p-2 rounded-lg w-1/3"
              />
              <button onClick={() => removeExtra(i)} className="text-red-500">
                ✕
              </button>
            </div>
          ))}
          <button onClick={addExtraRow} className="text-sm text-blue-600">
            + Add Extra
          </button>
        </div>
      )}

      <div className="fixed bottom-16 left-0 right-0 px-4">
        <button
          onClick={saveMenu}
          className="w-full bg-green-600 text-white py-3 rounded-xl"
        >
          Save {mealSlot === "lunch" ? "Lunch" : "Dinner"} Menu
        </button>
      </div>
    </div>
  );
}
