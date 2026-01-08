import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import {
  getKitchenConfig,
  updateKitchenConfig,
} from "../../services/kitchenService";

export default function KitchenSettings() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getKitchenConfig();
      setConfig(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading kitchen settings…
      </p>
    );
  }

  const holiday = config.holiday || {};

  const save = async () => {
    setSaving(true);
    try {
      await updateKitchenConfig(config);
      alert("Kitchen settings updated");
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 bg-[#faf9f6] min-h-screen">
      <PageHeader name="Kitchen Settings" />

      <div className="mt-8 space-y-6 max-w-3xl">
        {/* KITCHEN TIMINGS */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-md p-6 ring-1 ring-black/5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
            KITCHEN TIMINGS
          </h3>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Opens At</label>
              <input
                type="time"
                value={config.openTime}
                onChange={(e) =>
                  setConfig({ ...config, openTime: e.target.value })
                }
                className="mt-1 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm
                           ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                           outline-none transition"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs text-gray-500">Closes At</label>
              <input
                type="time"
                value={config.closeTime}
                onChange={(e) =>
                  setConfig({ ...config, closeTime: e.target.value })
                }
                className="mt-1 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm
                           ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                           outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* HOLIDAY SETTINGS */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-md p-6 ring-1 ring-black/5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 tracking-wide">
            KITCHEN HOLIDAY
          </h3>

          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={holiday.active}
              onChange={(e) =>
                setConfig({
                  ...config,
                  holiday: {
                    ...holiday,
                    active: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 accent-yellow-500"
            />
            <span className="text-sm text-gray-700">Enable holiday period</span>
          </label>

          {holiday.active && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="date"
                  value={holiday.from || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      holiday: { ...holiday, from: e.target.value },
                    })
                  }
                  className="flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm
                             ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                             outline-none transition"
                />

                <input
                  type="date"
                  value={holiday.to || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      holiday: { ...holiday, to: e.target.value },
                    })
                  }
                  className="flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm
                             ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                             outline-none transition"
                />
              </div>

              <input
                type="text"
                placeholder="Reason (optional)"
                value={holiday.reason || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    holiday: {
                      ...holiday,
                      reason: e.target.value,
                    },
                  })
                }
                className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm
                           ring-1 ring-black/10 focus:ring-2 focus:ring-yellow-300
                           outline-none transition"
              />
            </div>
          )}
        </div>

        {/* SAVE BUTTON */}
        <button
          disabled={saving}
          onClick={save}
          className="w-full rounded-2xl bg-yellow-600 hover:bg-yellow-700
                     text-white py-4 text-base font-semibold
                     shadow-sm transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
