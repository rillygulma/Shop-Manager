"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

type POSTransactionType =
  | "withdrawal"
  | "deposit"
  | "transfer"
  | "airtime"
  | "data"
  | "other";

type POSTransaction = {
  type: POSTransactionType;
  amount: number;
  charge: number;
};

export default function AddSales() {
  const router = useRouter();

  const [typing, setTyping] = useState(0);
  const [printing, setPrinting] = useState(0);
  const [photocopying, setPhotocopying] = useState(0);
  const [browsing, setBrowsing] = useState(0);

  const [softdrinks, setSoftdrinks] = useState(0);
  const [water, setWater] = useState(0);

  const [posTransactions, setPosTransactions] = useState<
    POSTransaction[]
  >([]);

  const [posType, setPosType] =
    useState<POSTransactionType>("withdrawal");

  const [posAmount, setPosAmount] = useState(0);
  const [posCharge, setPosCharge] = useState(0);

  const [saving, setSaving] = useState(false);

  const posTypesWithCharges: POSTransactionType[] = [
    "withdrawal",
    "deposit",
    "transfer",
    "other",
  ];

  const hasCharge =
    posTypesWithCharges.includes(posType);

  const posTotalAmount = posTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const posTotalCharges = posTransactions.reduce(
    (sum, transaction) => sum + transaction.charge,
    0
  );

  const computerTotal =
    typing +
    printing +
    photocopying +
    browsing;

  const drinksTotal =
    softdrinks + water;

  const total =
    computerTotal +
    drinksTotal +
    posTotalCharges;

  const addPOSTransaction = () => {
    if (posAmount <= 0) {
      toast.error("Enter a valid POS amount");
      return;
    }

    const charge =
      posTypesWithCharges.includes(posType)
        ? posCharge
        : 0;

    const transaction: POSTransaction = {
      type: posType,
      amount: posAmount,
      charge,
    };

    setPosTransactions((prev) => [
      ...prev,
      transaction,
    ]);

    setPosAmount(0);
    setPosCharge(0);
  };

  const removePOSTransaction = (index: number) => {
    setPosTransactions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const save = async () => {
    if (saving) return;

    setSaving(true);

    const loadingToast = toast.loading(
      "Saving sales..."
    );

    try {
      // Save daily sales
      const salesRes = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          computer: {
            typing,
            printing,
            photocopying,
            browsing,
            other: 0,
          },

          // POS is now handled separately
          pos: {
            charges: posTotalCharges,
          },

          drinks: {
            softdrinks,
            water,
            other: 0,
          },
        }),
      });

      if (!salesRes.ok) {
        throw new Error(
          "Failed to save daily sales"
        );
      }

      // Save each POS transaction separately
      for (const transaction of posTransactions) {
        const posRes = await fetch("/api/pos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: transaction.type,
            amount: transaction.amount,
            charge: transaction.charge,
          }),
        });

        if (!posRes.ok) {
          throw new Error(
            "Failed to save POS transaction"
          );
        }
      }

      toast.success(
        "Sales and POS transactions recorded ✅",
        {
          id: loadingToast,
        }
      );

      setTimeout(() => {
        router.push("/sales");
      }, 500);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to save sales ❌",
        {
          id: loadingToast,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>

        Record Sales
      </h1>

      <div className="grid md:grid-cols-3 gap-5">
        {/* COMPUTER SERVICES */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">
            🖥️ Computer Services
          </h2>

          <Input
            label="Typing"
            value={typing}
            setValue={setTyping}
          />

          <Input
            label="Printing"
            value={printing}
            setValue={setPrinting}
          />

          <Input
            label="Photocopying"
            value={photocopying}
            setValue={setPhotocopying}
          />

          <Input
            label="Browsing"
            value={browsing}
            setValue={setBrowsing}
          />
        </div>

        {/* POS */}
        <div className="bg-white p-4 rounded-xl shadow md:col-span-1">
          <h2 className="font-semibold mb-3 text-gray-700">
            💳 POS Transactions
          </h2>

          <div className="mb-3">
            <label className="text-sm text-gray-500">
              Transaction Type
            </label>

            <select
              value={posType}
              onChange={(e) => {
                const value =
                  e.target.value as POSTransactionType;

                setPosType(value);

                if (
                  value === "airtime" ||
                  value === "data"
                ) {
                  setPosCharge(0);
                }
              }}
              className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="withdrawal">
                Withdrawal
              </option>

              <option value="deposit">
                Deposit
              </option>

              <option value="transfer">
                Transfer
              </option>

              <option value="airtime">
                Airtime
              </option>

              <option value="data">
                Data
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <Input
            label="Amount"
            value={posAmount}
            setValue={setPosAmount}
          />

          {hasCharge && (
            <Input
              label="POS Charge"
              value={posCharge}
              setValue={setPosCharge}
            />
          )}

          <button
            type="button"
            onClick={addPOSTransaction}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Add Transaction
          </button>

          {/* POS TRANSACTION LIST */}
          {posTransactions.length > 0 && (
            <div className="mt-5 space-y-2">
              <h3 className="font-medium text-gray-700">
                Transactions
              </h3>

              {posTransactions.map(
                (transaction, index) => (
                  <div
                    key={`${transaction.type}-${index}`}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.type}
                        </p>

                        <p className="text-sm text-gray-500">
                          Amount: ₦
                          {transaction.amount.toLocaleString()}
                        </p>

                        {transaction.charge > 0 && (
                          <p className="text-sm text-green-600">
                            Charge: ₦
                            {transaction.charge.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removePOSTransaction(index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                )
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span>POS Amount</span>
                  <span className="font-medium">
                    ₦
                    {posTotalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-green-600">
                  <span>POS Charges</span>
                  <span className="font-semibold">
                    ₦
                    {posTotalCharges.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DRINKS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3 text-gray-700">
            🥤 Drinks
          </h2>

          <Input
            label="Soft Drinks"
            value={softdrinks}
            setValue={setSoftdrinks}
          />

          <Input
            label="Water"
            value={water}
            setValue={setWater}
          />
        </div>
      </div>

      {/* TOTAL */}
      <div className="mt-6 bg-white p-5 rounded-xl shadow flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-green-600">
            Total Revenue: ₦
            {total.toLocaleString()}
          </h2>

          {posTotalCharges > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              POS Charges: ₦
              {posTotalCharges.toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition mt-4 md:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />

          {saving ? "Saving..." : "Save Sales"}
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
      <label className="text-sm text-gray-500">
        {label}
      </label>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) =>
          setValue(Number(e.target.value) || 0)
        }
        className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
