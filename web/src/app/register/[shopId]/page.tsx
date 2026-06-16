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

function DateMonthFields({ prefix, label, helpText }: { prefix: string; label: string; helpText?: string }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-[#111827]">{label}</p>
      {helpText ? <p className="mb-2 text-[13px] text-[#6B7280]">{helpText}</p> : null}
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-background px-5 text-center pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <CheckCircle2 className="h-24 w-24 text-[#10B981]" />
        <h1 className="mt-6 text-3xl font-bold text-[#111827]">You are registered</h1>
        <p className="mt-2 text-muted-foreground">You will receive wishes, offers, and rewards from {shopName} on WhatsApp.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <h1 className="text-3xl font-bold text-[#111827]">Join {shopName} Rewards</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Receive birthday wishes, festival offers, special greetings, and customer rewards on WhatsApp.</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          if (!env.apiBaseUrl) {
            setError("Registration is temporarily unavailable. Please try again later.");
            return;
          }
          const form = new FormData(event.currentTarget);
          const rawWhatsapp = String(form.get("whatsapp") ?? "");
          let cleanedWhatsapp = rawWhatsapp.replace(/\D/g, "");
          if (cleanedWhatsapp.length === 10) {
            cleanedWhatsapp = "91" + cleanedWhatsapp;
          }
          try {
            const response = await fetch(`${env.apiBaseUrl}/api/public/shops/${params.shopId}/customers`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                name: form.get("name"),
                whatsappNumber: cleanedWhatsapp,
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
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-[#111827]">Full Name</label>
          <Input id="name" name="name" placeholder="Enter your full name" required />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block mb-2 text-sm font-medium text-[#111827]">WhatsApp Number</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-muted-foreground font-semibold text-base border-r pr-2 border-border">+91</span>
            <Input 
              id="whatsapp"
              name="whatsapp" 
              placeholder="10-digit WhatsApp number" 
              inputMode="tel" 
              required 
              className="pl-16"
              pattern="[6-9][0-9]{9}"
              title="Please enter a valid 10-digit Indian mobile number"
            />
          </div>
        </div>
        <DateMonthFields prefix="birthday" label="Birthday (Optional)" helpText="Receive birthday wishes and rewards." />
        {!showAnniversary ? (
          <button 
            type="button" 
            onClick={() => setShowAnniversary(true)}
            className="w-full h-12 rounded-xl border border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            + Add Anniversary (Optional)
          </button>
        ) : (
          <div className="space-y-2">
            <DateMonthFields prefix="anniversary" label="Anniversary (Optional)" />
            <button 
              type="button" 
              onClick={() => setShowAnniversary(false)}
              className="text-[13px] text-[#6B7280] hover:underline"
            >
              Remove Anniversary
            </button>
          </div>
        )}
        <label className="flex items-start gap-3 text-sm text-[#374151] cursor-pointer select-none py-1 min-h-[44px]">
          <input type="checkbox" required className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary shrink-0" />
          <span>
            I agree to receive occasional WhatsApp greetings, offers and reminders from this business.
          </span>
        </label>
        <p className="-mt-2 text-[13px] text-[#6B7280] leading-relaxed">
          Your details are stored securely and processed in compliance with Indian DPDP Act guidelines. We use your details only to send you rewards and wishes from this shop.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit">Submit</Button>
      </form>
    </main>
  );
}
