"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

export default function AddSales() {
  const router = useRouter();

  // 🖥️ Computer services
  const [typing, setTyping] = useState(0);
  const [printing, setPrinting] = useState(0);
  const [browsing, setBrowsing] = useState(0);

  // 💳 POS
  const [posCharges, setPosCharges] = useState(0);

  // 🥤 Drinks
  const [coke, setCoke] = useState(0);
  const [water, setWater] = useState(0);

  // 🧮 Calculate total live
  const total =
    typing + printing + browsing + posCharges + coke + water;

  const save = async () => {
    await fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        computer: { typing, printing, browsing, other: 0 },
        pos: { charges: posCharges },
        drinks: { coke, water, other: 0 },
        date: new Date().toISOString(),
      }),
    });

    alert("Sales recorded ✅");
    router.push("/sales");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      {/* 🔝 Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Record Sales
      </h1>

      {/* 🧾 FORM */}
      <div className="grid md:grid-cols-3 gap-5">
        
        {/* 🖥️ Computer Services */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">
            🖥️ Computer Services
          </h2>

          <Input label="Typing" value={typing} setValue={setTyping} />
          <Input label="Printing" value={printing} setValue={setPrinting} />
          <Input label="Browsing" value={browsing} setValue={setBrowsing} />
        </div>

        {/* 💳 POS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">
            💳 POS
          </h2>

          <Input label="POS Charges" value={posCharges} setValue={setPosCharges} />
        </div>

        {/* 🥤 Drinks */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">
            🥤 Drinks
          </h2>

          <Input label="Coke" value={coke} setValue={setCoke} />
          <Input label="Water" value={water} setValue={setWater} />
        </div>
      </div>

      {/* 💰 TOTAL + ACTION */}
      <div className="mt-6 bg-white p-5 rounded-xl shadow flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-xl font-bold text-green-600">
          Total: ₦{total}
        </h2>

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

/* 🔹 Reusable Input Component */
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