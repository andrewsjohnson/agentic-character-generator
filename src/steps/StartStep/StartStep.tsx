import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StepProps } from '../types';
import { deserializeCharacter } from '../../rules/serialization';
import { capture } from '../../analytics/index';

export function StartStep({ replaceCharacter, onEnablePackIds }: StepProps) {
  const navigate = useNavigate();
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    capture('character_started', { method: 'new' });
    replaceCharacter?.({});
    navigate('/name');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      capture('character_import_failed', { reason: 'not_json' });
      setImportError('Please select a .json file.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') {
        setImportError('Failed to read file.');
        return;
      }

      const result = deserializeCharacter(content);
      if (!result.success) {
        capture('character_import_failed', { reason: result.error });
        setImportError(result.error);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      capture('character_imported', { enabled_pack_count: result.enabledPackIds.length });
      setImportError(null);
      if (result.enabledPackIds.length > 0 && onEnablePackIds) {
        onEnablePackIds(result.enabledPackIds);
      }
      replaceCharacter?.(result.character);
      navigate('/review');
    };

    reader.onerror = () => {
      capture('character_import_failed', { reason: 'file_read_error' });
      setImportError('Failed to read file.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Welcome to D&D 5e Character Creator</h2>
      <p className="text-gray-600 mb-8">
        Create a new character from scratch using the step-by-step wizard, or
        import a previously exported character to view or edit it.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={handleCreateNew}
          className="p-6 border-2 border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
        >
          <h3 className="text-lg font-bold text-blue-800 mb-2">Create New Character</h3>
          <p className="text-sm text-blue-600">
            Start building a character from the beginning with the step-by-step wizard.
          </p>
        </button>

        <div className="p-6 border-2 border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Import Character</h3>
          <p className="text-sm text-gray-600 mb-4">
            Load a previously exported character JSON file.
          </p>
          <label className="block">
            <span className="sr-only">Choose character file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-gray-200 file:text-gray-700
                hover:file:bg-gray-300
                file:cursor-pointer cursor-pointer"
            />
          </label>
        </div>
      </div>

      {importError && (
        <div
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700"
          role="alert"
        >
          {importError}
        </div>
      )}
    </div>
  );
}
