import { useState } from 'react';
import type { ExpansionPack } from '../types/expansion-pack';

type ExpansionPackToggleProps = {
  packs: ExpansionPack[];
  enabledPackIds: string[];
  onChange: (enabledIds: string[]) => void;
};

export function ExpansionPackToggle({ packs, enabledPackIds, onChange }: ExpansionPackToggleProps) {
  const [open, setOpen] = useState(false);

  const enabledCount = enabledPackIds.length;

  const handleToggle = (packId: string) => {
    if (enabledPackIds.includes(packId)) {
      onChange(enabledPackIds.filter(id => id !== packId));
    } else {
      onChange([...enabledPackIds, packId]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        data-testid="expansion-pack-toggle-button"
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
      >
        <span>Expansion Packs</span>
        {enabledCount > 0 && (
          <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {enabledCount}
          </span>
        )}
        <span aria-hidden="true" className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          data-testid="expansion-pack-panel"
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Expansion Packs</h2>
            <p className="text-xs text-gray-500 mt-1">
              Enable packs to add extra options to each selection step.
            </p>
          </div>

          {packs.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No expansion packs available.</p>
          ) : (
            <ul className="p-2 space-y-1">
              {packs.map(pack => {
                const isEnabled = enabledPackIds.includes(pack.id);
                return (
                  <li key={pack.id}>
                    <label
                      className="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                      data-testid={`expansion-pack-label-${pack.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggle(pack.id)}
                        data-testid={`expansion-pack-checkbox-${pack.id}`}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{pack.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{pack.description}</p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
