"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { addNote, deleteNote, updateNote } from "@/lib/actions/properties";
import type { Note } from "@/lib/types";

export function NotesPanel({
  propertyId,
  notes,
}: {
  propertyId: string;
  notes: Note[];
}) {
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Site notes, seller comments, red flags…"
        />
        <Button
          disabled={!body.trim()}
          onClick={async () => {
            await addNote(propertyId, body.trim());
            setBody("");
          }}
        >
          Add note
        </Button>
      </div>
      <ol className="space-y-4">
        {notes.map((note) => (
          <li key={note.id} className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {new Date(note.created_at).toLocaleString()}
            </p>
            {editing[note.id] != null ? (
              <div className="space-y-3">
                <Textarea
                  value={editing[note.id]}
                  onChange={(e) =>
                    setEditing((current) => ({ ...current, [note.id]: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await updateNote(note.id, propertyId, editing[note.id]);
                      setEditing((current) => {
                        const next = { ...current };
                        delete next[note.id];
                        return next;
                      });
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditing((current) => {
                        const next = { ...current };
                        delete next[note.id];
                        return next;
                      })
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{note.body}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className="text-sm text-primary"
                    onClick={() => setEditing((current) => ({ ...current, [note.id]: note.body }))}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-sm text-destructive"
                    onClick={() => deleteNote(note.id, propertyId)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
