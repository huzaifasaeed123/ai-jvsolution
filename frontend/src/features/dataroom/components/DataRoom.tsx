'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DataRoom as DataRoomData, DataRoomDocument } from '../types';
import { initDataRoom, deleteDocument } from '../actions';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DataRoom({ opportunityId, data }: { opportunityId: string; data: DataRoomData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const docsByFolder = new Map<string, DataRoomDocument[]>();
  for (const d of data.documents) {
    const arr = docsByFolder.get(d.folderId) ?? [];
    arr.push(d);
    docsByFolder.set(d.folderId, arr);
  }

  function run(fn: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  if (!data.initialized) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm font-medium">📁 No data room yet</p>
        <p className="mt-1 text-sm text-muted">
          {data.isOwner
            ? 'Set up the standard 48-section data room to start uploading documents.'
            : 'The owner has not opened a data room for this opportunity yet.'}
        </p>
        {data.isOwner && (
          <button
            onClick={() => run(() => initDataRoom(opportunityId))}
            disabled={pending}
            className="btn btn-primary mt-4"
          >
            {pending ? 'Setting up…' : 'Initialize data room'}
          </button>
        )}
      </div>
    );
  }

  const accessibleFolders = data.folders.filter((f) => f.accessible);
  const lockedCount = data.folders.length - accessibleFolders.length;

  return (
    <div className="space-y-3">
      {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

      {accessibleFolders.map((folder) => {
        const docs = docsByFolder.get(folder.id) ?? [];
        return (
          <div key={folder.id} className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {folder.code && <span className="mr-2 font-mono text-xs text-muted">{folder.code}</span>}
                {folder.name}
              </p>
              {data.isOwner && <UploadButton opportunityId={opportunityId} folderId={folder.id} onDone={() => router.refresh()} />}
            </div>

            {docs.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 rounded-md bg-foreground/[0.03] px-3 py-2 text-sm">
                    <a
                      href={`/api/documents/${d.id}/download`}
                      className="min-w-0 truncate font-medium text-primary hover:underline"
                    >
                      {d.latest?.fileName ?? d.name}
                    </a>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                      {d.latest && <span>{formatSize(d.latest.sizeBytes)}</span>}
                      {data.isOwner && (
                        <button
                          onClick={() => run(() => deleteDocument(d.id, opportunityId))}
                          disabled={pending}
                          className="hover:text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {lockedCount > 0 && (
        <div className="card p-4 text-sm text-muted">
          🔒 {lockedCount} more section{lockedCount === 1 ? '' : 's'} unlock at higher access levels
          (due diligence / transaction).
        </div>
      )}
    </div>
  );
}

function UploadButton({
  opportunityId,
  folderId,
  onDone,
}: {
  opportunityId: string;
  folderId: string;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('folderId', folderId);
      form.append('file', file);
      const res = await fetch(`/api/opportunities/${opportunityId}/documents`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message ?? 'Upload failed');
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" className="hidden" onChange={onChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn btn-outline px-2.5 py-1 text-xs"
        title={error ?? undefined}
      >
        {uploading ? 'Uploading…' : '+ Upload'}
      </button>
    </>
  );
}
