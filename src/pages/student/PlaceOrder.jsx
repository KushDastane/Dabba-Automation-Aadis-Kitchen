import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getTodayKey } from "../../services/menuService";
import { placeStudentOrder } from "../../services/orderService";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

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
    <div className="pb-36 bg-[#faf9f6] min-h-screen">
      {/* HEADER */}
      <div className="px-4 pt-4 mb-4">
        <p className="text-xs text-gray-500 mb-1">
          Today • {mealSlotToShow?.toUpperCase()}
        </p>
        <h2 className="text-xl font-semibold">Build Your Thali</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose one option to continue
        </p>

        {!canPlaceOrder && (
          <p className="text-xs text-red-600 mt-1">
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
        <div className="mt-6 px-4">
          <h3 className="text-sm font-medium mb-3 text-gray-700">
            Add-ons (Optional)
          </h3>

          <div className="space-y-3">
            {menu.extras.map((e) => (
              <div
                key={e.name}
                className="bg-white rounded-xl px-4 py-3 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-gray-500">₹{e.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateExtraQty(e.name, -1)}
                    className="w-8 h-8 rounded-full bg-gray-100"
                  >
                    −
                  </button>
                  <span className="font-medium">{extrasQty[e.name] || 0}</span>
                  <button
                    onClick={() => updateExtraQty(e.name, 1)}
                    className="w-8 h-8 rounded-full bg-gray-100"
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
      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-xl font-semibold">₹{total}</span>
          </div>
        </div>

        <button
          disabled={!selectedItem || !canPlaceOrder}
          onClick={handlePlaceOrder}
          className={`w-full py-3 rounded-xl font-medium flex justify-center items-center gap-2 ${
            selectedItem && canPlaceOrder
              ? "bg-yellow-400 text-black"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {canPlaceOrder ? "Place Order" : "Orders Closed"}
        </button>

        {!canPlaceOrder && (
          <p className="text-center text-xs text-red-600 mt-2">
            Try calling Mavshi for urgent request
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- MENU CARD ---------------- */

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
      className={`relative bg-white rounded-2xl p-4 cursor-pointer transition-all
        ${
          selected
            ? "ring-2 ring-yellow-400 shadow-md"
            : "border border-gray-200 hover:shadow-md"
        }`}
    >
      {/* RADIO INDICATOR */}
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
        <p className="font-semibold text-base">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        <p className="mt-2 text-lg font-semibold">₹{price}</p>
      </div>

      {/* QUANTITY ONLY AFTER SELECTION */}
      {selected && (
        <div className="flex justify-end items-center gap-4 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQtyChange((q) => Math.max(1, q - 1));
            }}
            className="w-9 h-9 rounded-full bg-gray-100 text-lg"
          >
            −
          </button>

          <span className="font-semibold">{quantity}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQtyChange((q) => q + 1);
            }}
            className="w-9 h-9 rounded-full bg-gray-100 text-lg"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
