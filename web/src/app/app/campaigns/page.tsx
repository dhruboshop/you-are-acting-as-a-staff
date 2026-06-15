"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { festivals } from "@/lib/demo-data";

const variants = [
  "Hi {name}, wishing you a joyful festival season from Radha Jewels. Visit us this week for something special.",
  "Dear {name}, celebrate with Radha Jewels. We have a small festive surprise waiting for you.",
  "{name}, may this season bring happiness to your home. Thank you for being part of Radha Jewels."
];

const campaignTypes = ["Birthday", "Anniversary", "Festival", "Win-back"];

export default function CampaignsPage() {
  const [type, setType] = useState("Birthday");
  const [message, setMessage] = useState(variants[0]);
  const [generated, setGenerated] = useState<string[]>([]);

  return (
    <AppShell active="Campaigns">
      <section className="px-5 py-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="mt-2 text-muted-foreground">Generate, approve, and queue WhatsApp messages.</p>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {campaignTypes.map((item) => (
            <button key={item} onClick={() => setType(item)} className={`shrink-0 rounded-full border px-3 py-2 text-sm ${type === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
              {item}
            </button>
          ))}
        </div>
        {type === "Festival" ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {festivals.map((festival) => (
              <Card key={festival} className="p-3 text-center text-sm font-semibold">{festival}</Card>
            ))}
          </div>
        ) : null}
        <Card className="mt-5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">AI Message</h2>
            <Button size="sm" variant="secondary" onClick={() => setGenerated(variants)}>
              <Wand2 className="h-4 w-4" />
              Generate
            </Button>
          </div>
          <Textarea className="mt-3" value={message} onChange={(event) => setMessage(event.target.value)} />
        </Card>
        {generated.length ? (
          <div className="mt-4 space-y-3">
            {generated.map((variant) => (
              <Card key={variant} role="button" onClick={() => setMessage(variant)} className="p-3 text-sm">
                {variant}
              </Card>
            ))}
          </div>
        ) : null}
        <div className="safe-bottom mt-6 space-y-3">
          <Button className="w-full">Approve & Queue</Button>
          <Button className="w-full" variant="secondary">Save Template</Button>
        </div>
      </section>
    </AppShell>
  );
}
