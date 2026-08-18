"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { saveRenovationPlan, type RenoItemInput } from "@/lib/actions/renovation";
import { formatTHB } from "@/lib/format";
import { compressImage } from "@/lib/image";
import type { RenovationGenerate } from "@/lib/schemas";
import {
  RENO_CATEGORIES,
  RENO_ITEM_STATUSES,
  RENO_PLAN_STATUSES,
  type Media,
  type RenoPlanStatus,
  type RenovationItem,
  type RenovationPlan,
} from "@/lib/types";

function itemTotal(item: Pick<RenoItemInput, "quantity" | "unit_cost">) {
  return (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);
}

function toInput(item: RenovationItem, index: number): RenoItemInput {
  return {
    id: item.id,
    room: item.room,
    category: item.category,
    description: item.description,
    quantity: Number(item.quantity),
    unit: item.unit,
    unit_cost: Number(item.unit_cost),
    status: item.status,
    sort_order: item.sort_order ?? index,
    notes: item.notes,
  };
}

export function RenovationPanel({
  propertyId,
  plan,
  items,
  media,
}: {
  propertyId: string;
  plan: RenovationPlan | null;
  items: RenovationItem[];
  media: Media[];
}) {
  const [title, setTitle] = useState(plan?.title ?? "Renovation plan");
  const [status, setStatus] = useState<RenoPlanStatus>(plan?.status ?? "draft");
  const [summary, setSummary] = useState(plan?.ai_summary ?? "");
  const [rows, setRows] = useState<RenoItemInput[]>(
    items.map(toInput).length
      ? items.map(toInput)
      : [],
  );
  const [brief, setBrief] = useState("");
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState<"generate" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const total = useMemo(
    () => rows.reduce((sum, item) => sum + itemTotal(item), 0),
    [rows],
  );

  function updateRow(index: number, patch: Partial<RenoItemInput>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function generate() {
    setBusy("generate");
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("notes", brief);
      for (const item of media.filter((m) => m.kind === "gallery" || m.kind === "renovation")) {
        form.append("storagePaths", item.storage_path);
      }
      for (const file of extraFiles) {
        form.append("images", await compressImage(file));
      }
      const res = await fetch("/api/renovation", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not generate plan");
      const generated = json.plan as RenovationGenerate;
      setTitle(generated.title || title);
      setSummary(generated.ai_summary || "");
      setRows(
        generated.items.map((item, index) => ({
          room: item.room,
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          status: item.status,
          sort_order: index,
          notes: item.notes,
        })),
      );
      setMessage("Draft generated. Edit any line, then save.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    setError(null);
    setMessage(null);
    const result = await saveRenovationPlan({
      propertyId,
      title,
      status,
      ai_summary: summary,
      items: rows,
    });
    if (result.error) setError(result.error);
    else setMessage("Plan saved.");
    setBusy(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Optional. Generate a detailed budget from walkthrough photos, then edit
          every line.
        </p>
        <Textarea
          className="mt-3"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Focus on kitchen, roof, and converting the ground floor for rental…"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-primary underline">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => setExtraFiles(Array.from(e.target.files ?? []))}
            />
            Extra photos {extraFiles.length ? `(${extraFiles.length})` : ""}
          </label>
          <Button onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate from photos
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Plan title
          </span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as RenoPlanStatus)}
        >
          {RENO_PLAN_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Summary and assumptions"
      />

      <div className="flex items-center justify-between">
        <p className="font-semibold tracking-tight text-2xl text-foreground">{formatTHB(total)}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setRows((current) => [
              ...current,
              {
                room: "",
                category: "other",
                description: "",
                quantity: 1,
                unit: "item",
                unit_cost: 0,
                status: "todo",
                sort_order: current.length,
                notes: "",
              },
            ])
          }
        >
          <Plus className="size-4" />
          Line item
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id ?? index} className="rounded-lg border border-border bg-card p-3">
            <div className="grid gap-2 md:grid-cols-6">
              <Input
                placeholder="Room"
                value={row.room ?? ""}
                onChange={(e) => updateRow(index, { room: e.target.value })}
              />
              <Select
                value={row.category ?? "other"}
                onChange={(e) => updateRow(index, { category: e.target.value })}
              >
                {RENO_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Input
                className="md:col-span-2"
                placeholder="Work"
                value={row.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
              />
              <Input
                inputMode="decimal"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
              />
              <Input
                inputMode="decimal"
                placeholder="Unit cost"
                value={row.unit_cost}
                onChange={(e) => updateRow(index, { unit_cost: Number(e.target.value) })}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Input
                  className="w-24"
                  value={row.unit}
                  onChange={(e) => updateRow(index, { unit: e.target.value })}
                />
                <Select
                  className="w-32"
                  value={row.status}
                  onChange={(e) =>
                    updateRow(index, {
                      status: e.target.value as RenoItemInput["status"],
                    })
                  }
                >
                  {RENO_ITEM_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{formatTHB(itemTotal(row))}</span>
                <button
                  type="button"
                  onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            </div>
            <Input
              className="mt-2"
              placeholder="Line notes"
              value={row.notes ?? ""}
              onChange={(e) => updateRow(index, { notes: e.target.value })}
            />
          </div>
        ))}
      </div>

      <Button onClick={save} disabled={busy === "save"}>
        {busy === "save" && <LoaderCircle className="size-4 animate-spin" />}
        Save renovation plan
      </Button>
      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
