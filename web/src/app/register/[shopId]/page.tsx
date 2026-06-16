"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function toStoredDate(day: FormDataEntryValue | null, month: FormDataEntryValue | null) {
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  if (!dayNumber || !monthNumber) return null;
  return `2000-${String(monthNumber).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

function DateMonthFields({ prefix, label }: { prefix: string; label: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
        <select name={`${prefix}Day`} className="h-12 rounded-xl border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring">
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select name={`${prefix}Month`} className="h-12 rounded-xl border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring">
          <option value="">Month</option>
          {months.map((month, index) => (
            <option key={month} value={index + 1}>{month}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const params = useParams<{ shopId: string }>();
  const [shopName, setShopName] = useState("this shop");
  const [done, setDone] = useState(false);
  const [showAnniversary, setShowAnniversary] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!env.apiBaseUrl) return;
    fetch(`${env.apiBaseUrl}/api/public/shops/${params.shopId}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (typeof body?.shop?.name === "string") setShopName(body.shop.name);
      })
      .catch(() => undefined);
  }, [params.shopId]);

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-background px-5 text-center">
        <CheckCircle2 className="h-24 w-24 text-[#10B981]" />
        <h1 className="mt-6 text-3xl font-bold">You are registered</h1>
        <p className="mt-2 text-muted-foreground">You will receive wishes, offers, and rewards from {shopName} on WhatsApp.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 py-8">
      <h1 className="text-3xl font-bold">Join {shopName}</h1>
      <p className="mt-2 text-muted-foreground">Receive birthday wishes, festival offers, special greetings, and customer rewards on WhatsApp.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          if (!env.apiBaseUrl) {
            setError("Registration is temporarily unavailable. Please try again later.");
            return;
          }
          const form = new FormData(event.currentTarget);
          try {
            const response = await fetch(`${env.apiBaseUrl}/api/public/shops/${params.shopId}/customers`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                name: form.get("name"),
                whatsappNumber: form.get("whatsapp"),
                birthday: toStoredDate(form.get("birthdayDay"), form.get("birthdayMonth")),
                anniversary: showAnniversary ? toStoredDate(form.get("anniversaryDay"), form.get("anniversaryMonth")) : null,
                consent: true
              })
            });
            if (!response.ok) {
              setError("Could not save your registration. Please check the number and try again.");
              return;
            }
            setDone(true);
          } catch {
            setError("Could not save your registration. Please check the number and try again.");
          }
        }}
      >
        <Input name="name" placeholder="Name" required />
        <Input name="whatsapp" placeholder="WhatsApp Number" inputMode="tel" required />
        <DateMonthFields prefix="birthday" label="Birthday (optional)" />
        <label className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-sm font-medium">
          <input type="checkbox" checked={showAnniversary} onChange={(event) => setShowAnniversary(event.target.checked)} />
          Add Anniversary (optional)
        </label>
        {showAnniversary ? <DateMonthFields prefix="anniversary" label="Anniversary" /> : null}
        <label className="flex gap-3 text-sm text-muted-foreground">
          <input type="checkbox" required className="mt-1" /> I agree to receive WhatsApp messages from {shopName} including birthday wishes, festival offers, and promotional rewards.
        </label>
        <p className="-mt-2 text-xs text-muted-foreground">Your number is used only to send you rewards and wishes from this shop. We never share your information.</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit">Submit</Button>
      </form>
    </main>
  );
}
