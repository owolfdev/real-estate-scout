import { formatCoords, formatNumber, formatTHB, formatTHBPerSqm, labelType } from "@/lib/format";
import type { PropertyDraft } from "@/lib/types";

function Fact({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  const empty =
    value == null || value === "" || (typeof value === "number" && Number.isNaN(value));
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{empty ? "—" : value}</p>
    </div>
  );
}

export function PropertyView({ draft }: { draft: PropertyDraft }) {
  const area = [draft.subdistrict, draft.district, draft.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      {(draft.original_text || draft.translated_summary) && (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs text-muted-foreground">From the sign</p>
          {draft.translated_summary && (
            <p className="text-sm leading-6">{draft.translated_summary}</p>
          )}
          {draft.original_text && (
            <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
              {draft.original_text}
            </p>
          )}
        </section>
      )}

      <section className="grid gap-5 sm:grid-cols-2">
        <Fact label="Type" value={labelType(draft.type)} />
        <Fact label="Source" value={draft.source} />
        <Fact label="Asking price" value={formatTHB(draft.asking_price)} />
        <Fact
          label="Price / sqm"
          value={formatTHBPerSqm(draft.asking_price, draft.usable_sqm)}
        />
        <Fact label="Usable area" value={formatNumber(draft.usable_sqm, " ㎡")} />
        <Fact label="Land" value={formatNumber(draft.land_sqm, " ㎡")} />
        <Fact label="Beds" value={draft.beds} />
        <Fact label="Baths" value={draft.baths} />
        <Fact label="Parking" value={draft.parking} />
        <Fact label="Year built" value={draft.year_built} />
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <Fact label="Address" value={draft.address_full} />
        <Fact label="Area" value={area} />
        <Fact label="Nearest station" value={draft.nearest_station} />
        <Fact
          label="Station distance"
          value={
            draft.station_distance_m != null
              ? `${draft.station_distance_m} m`
              : null
          }
        />
        <Fact label="Location" value={formatCoords(draft.lat, draft.lng)} />
        <Fact label="Phone" value={draft.phone} />
        <Fact label="Agent" value={draft.agent_name} />
        <Fact label="Agency" value={draft.agency} />
        <Fact label="Ownership" value={draft.ownership} />
        <Fact label="Condition" value={draft.condition} />
        <Fact label="Tags" value={draft.tags.join(", ")} />
      </section>

      {draft.intake_notes && (
        <section>
          <p className="text-xs text-muted-foreground">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
            {draft.intake_notes}
          </p>
        </section>
      )}
    </div>
  );
}
