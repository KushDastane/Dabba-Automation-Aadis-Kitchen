import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getTodayKey, getCurrentMealSlot } from "../../services/menuService";
import { placeStudentOrder } from "../../services/orderService";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function PlaceOrder() {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [extrasQty, setExtrasQty] = useState({});

  const mealSlot = getCurrentMealSlot(); // "lunch" | "dinner"

  useEffect(() => {
    if (!authUser) return;

    const checkExistingOrder = async () => {
      const q = query(
        collection(db, "orders"),
        where("studentId", "==", authUser.uid),
        where("date", "==", getTodayKey())
      );

      const snap = await getDocs(q);
      if (!snap.empty) {
        navigate("/student/orders");
      }
    };

    checkExistingOrder();
  }, [authUser]);

  useEffect(() => {
    const fetchMenu = async () => {
      const snap = await getDoc(doc(db, "menus", getTodayKey()));

      if (snap.exists() && snap.data()[mealSlot]) {
        setMenu(snap.data()[mealSlot]);
      } else {
        setMenu(null);
      }
      setLoading(false);
    };

    fetchMenu();
  }, [mealSlot]);

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
    if (!selectedItem) return;

    await placeStudentOrder({
      studentId: authUser.uid,
      mealType: mealSlot.toUpperCase(), // LUNCH | DINNER
      items: {
        item: selectedItem.label,
        unitPrice: selectedItem.price,
        quantity,
        extras: extrasQty,
      },
    });

    navigate("/student/orders");
  };

  if (loading) {
    return <p className="text-center mt-10">Loading menu...</p>;
  }

  if (!menu) {
    return (
      <p className="text-center text-gray-500 mt-10">
        {mealSlot === "lunch"
          ? "Lunch menu not available"
          : "Dinner menu not available"}
      </p>
    );
  }

  return (
    <div className="pb-32">
      <h2 className="text-xl font-semibold mb-4 capitalize">{mealSlot} Menu</h2>

      {/* ROTI SABZI */}
      {menu.type === "ROTI_SABZI" && (
        <>
          <MenuCard
            title="Half Dabba"
            description={menu.rotiSabzi.half.items.join(" + ")}
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
            description={menu.rotiSabzi.full.items.join(" + ")}
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

      {/* OTHER */}
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

      {/* EXTRAS */}
      {menu.extras?.length > 0 && selectedItem && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Extras</h3>
          {menu.extras.map((e) => (
            <div
              key={e.name}
              className="flex justify-between items-center mb-2"
            >
              <span>
                {e.name} – ₹{e.price}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateExtraQty(e.name, -1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  −
                </button>
                <span>{extrasQty[e.name] || 0}</span>
                <button
                  onClick={() => updateExtraQty(e.name, 1)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOTAL + PLACE ORDER */}
      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="bg-white border rounded-xl p-4 mb-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        <button
          disabled={!selectedItem}
          onClick={handlePlaceOrder}
          className={`w-full py-3 rounded-xl text-white ${
            selectedItem ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          Place Order
        </button>
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
      className={`p-4 rounded-xl border mb-3 transition ${
        selected ? "border-black bg-gray-50" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <p className="font-semibold">₹{price}</p>
      </div>

      {selected && (
        <div className="flex justify-end items-center gap-4 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQtyChange((q) => Math.max(1, q - 1));
            }}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            −
          </button>
          <span className="font-semibold">{quantity}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQtyChange((q) => q + 1);
            }}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
