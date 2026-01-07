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
    return <p className="text-center mt-10">Loading kitchen settings…</p>;
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
    <div className="pb-24">
      <PageHeader name="Kitchen Settings" />

      {/* OPEN / CLOSE */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-3">Kitchen Timings</h3>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Opens At</label>
            <input
              type="time"
              value={config.openTime}
              onChange={(e) =>
                setConfig({ ...config, openTime: e.target.value })
              }
              className="w-full border rounded-lg p-2 mt-1"
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
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
        </div>
      </div>

      {/* HOLIDAY */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-3">Kitchen Holiday</h3>

        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={holiday.active}
            onChange={(e) =>
              setConfig({
                ...config,
                holiday: { ...holiday, active: e.target.checked },
              })
            }
          />
          <span className="text-sm">Enable holiday</span>
        </label>

        {holiday.active && (
          <>
            <div className="flex gap-3 mb-3">
              <input
                type="date"
                value={holiday.from || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    holiday: { ...holiday, from: e.target.value },
                  })
                }
                className="flex-1 border rounded-lg p-2"
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
                className="flex-1 border rounded-lg p-2"
              />
            </div>

            <input
              type="text"
              placeholder="Reason (optional)"
              value={holiday.reason || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  holiday: { ...holiday, reason: e.target.value },
                })
              }
              className="w-full border rounded-lg p-2"
            />
          </>
        )}
      </div>

      <button
        disabled={saving}
        onClick={save}
        className="w-full bg-black text-white py-3 rounded-xl"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
