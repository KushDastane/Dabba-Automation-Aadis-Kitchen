import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getTodayKey } from "../../services/menuService";
import { placeStudentOrder } from "../../services/orderService";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

function MenuCard({
  title,
  description,
  price,
  selected,
  quantity,
  onSelect,
  onQtyChange,
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-3xl p-5 cursor-pointer transition-all
        ${
          selected
            ? "bg-yellow-50 ring-2 ring-yellow-400 shadow-md"
            : "bg-white/70 backdrop-blur-md ring-1 ring-black/5 hover:shadow-md"
        }`}
    >
      {/* indicator */}
      <div className="absolute top-4 right-4">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${
              selected ? "border-yellow-400 bg-yellow-400" : "border-gray-300"
            }`}
        >
          {selected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
        </div>
      </div>

      <div className="pr-10">
        <p className="font-semibold text-gray-900">{title}</p>

        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}

        <p className="mt-3 text-lg font-semibold text-gray-900">₹{price}</p>
      </div>

      {selected && (
        <div className="flex justify-end items-center gap-4 mt-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQtyChange((q) => Math.max(1, q - 1));
            }}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            −
          </button>

          <span className="font-semibold">{quantity}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQtyChange((q) => q + 1);
            }}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [extrasQty, setExtrasQty] = useState({});

  const currentHour = new Date().getHours();

  /* ---------------- TIME RULES ---------------- */

  const mealSlotToShow = useMemo(() => {
    if (currentHour < 14) return "lunch";
    if (currentHour < 21) return "dinner";
    return null;
  }, [currentHour]);

  const canPlaceOrder = useMemo(() => {
    if (mealSlotToShow === "lunch") return currentHour < 13;
    if (mealSlotToShow === "dinner") return currentHour < 20;
    return false;
  }, [mealSlotToShow, currentHour]);

  /* ---------------- FETCH MENU ---------------- */

  useEffect(() => {
    if (!mealSlotToShow) {
      setMenu(null);
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      const snap = await getDoc(doc(db, "menus", getTodayKey()));
      if (snap.exists() && snap.data()[mealSlotToShow]) {
        setMenu(snap.data()[mealSlotToShow]);
      } else {
        setMenu(null);
      }
      setLoading(false);
    };

    fetchMenu();
  }, [mealSlotToShow]);

  /* ---------------- HANDLERS ---------------- */

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setExtrasQty({});
  };

  const updateExtraQty = (name, delta) => {
    setExtrasQty((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + delta),
    }));
  };

  const total = useMemo(() => {
    if (!selectedItem) return 0;

    let sum = selectedItem.price * quantity;
    if (menu?.extras) {
      menu.extras.forEach((e) => {
        sum += (extrasQty[e.name] || 0) * e.price;
      });
    }
    return sum;
  }, [selectedItem, quantity, extrasQty, menu]);

  const handlePlaceOrder = async () => {
    if (!selectedItem || !canPlaceOrder) return;

    await placeStudentOrder({
      studentId: authUser.uid,
      mealType: mealSlotToShow.toUpperCase(),
      items: {
        item: selectedItem.label,
        unitPrice: selectedItem.price,
        quantity,
        extras: extrasQty,
      },
    });

    navigate("/history");
  };

  /* ---------------- STATES ---------------- */

  if (loading) {
    return <p className="text-center mt-10">Loading menu...</p>;
  }

  if (!menu) {
    return (
      <div className="text-center text-gray-500 mt-16 px-4">
        <p className="mb-3 text-lg font-medium">
          {mealSlotToShow
            ? `${mealSlotToShow === "lunch" ? "Lunch" : "Dinner"} not available`
            : "Kitchen closed for today"}
        </p>

        {!canPlaceOrder && (
          <p className="text-sm text-red-600">
            Stopped taking orders. Try calling Mavshi for urgent request
          </p>
        )}
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-36  min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-36">
        {/* HEADER */}
        <div className="px-4 pt-5 mb-6">
          <p className="text-xs text-gray-500 tracking-wide">
            TODAY • {mealSlotToShow?.toUpperCase()}
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            Build Your Thali
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Choose one option to continue
          </p>

          {!canPlaceOrder && (
            <p className="text-xs text-red-600 mt-2">
              Orders closed for this slot
            </p>
          )}
        </div>

        {/* MAIN MENU */}
        <div className="space-y-4 px-4">
          {menu.type === "ROTI_SABZI" && (
            <>
              <MenuCard
                title="Half Dabba"
                description={menu.rotiSabzi.half.items.join(" • ")}
                price={menu.rotiSabzi.half.price}
                selected={selectedItem?.key === "half"}
                quantity={quantity}
                onSelect={() =>
                  handleSelectItem({
                    key: "half",
                    label: "Half Dabba",
                    price: menu.rotiSabzi.half.price,
                  })
                }
                onQtyChange={setQuantity}
              />

              <MenuCard
                title="Full Dabba"
                description={menu.rotiSabzi.full.items.join(" • ")}
                price={menu.rotiSabzi.full.price}
                selected={selectedItem?.key === "full"}
                quantity={quantity}
                onSelect={() =>
                  handleSelectItem({
                    key: "full",
                    label: "Full Dabba",
                    price: menu.rotiSabzi.full.price,
                  })
                }
                onQtyChange={setQuantity}
              />
            </>
          )}

          {menu.type === "OTHER" && (
            <MenuCard
              title={menu.other.name}
              price={menu.other.price}
              selected={selectedItem?.key === "other"}
              quantity={quantity}
              onSelect={() =>
                handleSelectItem({
                  key: "other",
                  label: menu.other.name,
                  price: menu.other.price,
                })
              }
              onQtyChange={setQuantity}
            />
          )}
        </div>

        {/* EXTRAS */}
        {menu.extras?.length > 0 && selectedItem && (
          <div className="mt-8 px-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide">
              ADD-ONS (OPTIONAL)
            </h3>

            <div className="space-y-3">
              {menu.extras.map((e) => (
                <div
                  key={e.name}
                  className="rounded-2xl bg-white/70 backdrop-blur-md px-4 py-3
                         ring-1 ring-black/5 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500">₹{e.price}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateExtraQty(e.name, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      −
                    </button>

                    <span className="font-medium text-gray-800">
                      {extrasQty[e.name] || 0}
                    </span>

                    <button
                      onClick={() => updateExtraQty(e.name, 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM BAR */}
        {/* ORDER CTA */}
        <div
          className="
    fixed bottom-[64px]
    left-0 right-0
    z-40
  "
        >
          {/* WIDTH CONTAINER – SAME AS NAVBAR */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              disabled={!selectedItem || !canPlaceOrder}
              onClick={handlePlaceOrder}
              className={`w-full flex items-center justify-between
        py-3.5 px-6 rounded-2xl font-semibold transition
        ${
          selectedItem && canPlaceOrder
            ? "bg-yellow-400 hover:bg-yellow-500 text-black shadow-md"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
            >
              {/* LEFT */}
              <span>{canPlaceOrder ? "Place Order" : "Orders Closed"}</span>

              {/* RIGHT */}
              <span className="text-base font-bold">₹{total}</span>
            </button>

            {!canPlaceOrder && (
              <p className="text-center text-xs text-red-600 mt-2">
                Try calling Mavshi for urgent request
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
