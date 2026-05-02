"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AddSales() {
  const router = useRouter();

  const [typing, setTyping] = useState(0);
  const [printing, setPrinting] = useState(0);
  const [browsing, setBrowsing] = useState(0);

  const [posCharges, setPosCharges] = useState(0);

  const [coke, setCoke] = useState(0);
  const [water, setWater] = useState(0);

  const total = typing + printing + browsing + posCharges + coke + water;

  const save = async () => {
    const loadingToast = toast.loading("Saving sales..."); // ⏳

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          computer: { typing, printing, browsing, other: 0 },
          pos: { charges: posCharges },
          drinks: { coke, water, other: 0 },
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Sales recorded ✅", { id: loadingToast }); // ✅ replaces loading

      setTimeout(() => {
        router.push("/sales");
      }, 500);
    } catch (err) {
      toast.error("Failed to save sales ❌", { id: loadingToast }); // ❌ replaces loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-lg shadow"
        >
          <ArrowLeft size={18} />
        </button>
        Record Sales
      </h1>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">
            🖥️ Computer Services
          </h2>

          <Input label="Typing" value={typing} setValue={setTyping} />
          <Input label="Printing" value={printing} setValue={setPrinting} />
          <Input label="Browsing" value={browsing} setValue={setBrowsing} />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">💳 POS</h2>

          <Input
            label="POS Charges"
            value={posCharges}
            setValue={setPosCharges}
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">🥤 Drinks</h2>

          <Input label="Coke" value={coke} setValue={setCoke} />
          <Input label="Water" value={water} setValue={setWater} />
        </div>
      </div>

      <div className="mt-6 bg-white p-5 rounded-xl shadow flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-xl font-bold text-green-600">Total: ₦{total}</h2>

        <button
          onClick={save}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition mt-4 md:mt-0"
        >
          <Save size={18} />
          Save Sales
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <label className="text-sm text-gray-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(+e.target.value)}
        className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
