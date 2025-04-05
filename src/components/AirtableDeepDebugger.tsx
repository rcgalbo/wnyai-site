import React, { useState } from 'react';
import Airtable from 'airtable';

const AirtableDeepDebugger = () => {
  const [log, setLog] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState<'base' | 'table' | 'record'>('base');
  const [isRunning, setIsRunning] = useState(false);
  const [formData, setFormData] = useState({
    token: import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || '',
    baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || '',
    tableName: import.meta.env.VITE_AIRTABLE_EVENTS_TABLE || 'Events'
  });

  const addLog = (message: string, isError = false) => {
    setLog(prev => [...prev, `${isError ? '❌' : '✅'} ${message}`]);
  };

  const clearLog = () => {
    setLog([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const testBaseConnection = async () => {
    addLog(`Testing base connection with Base ID: ${formData.baseId}`);
    
    try {
      // Configure Airtable with token
      addLog('Configuring Airtable with Personal Access Token');
      Airtable.configure({
        apiKey: formData.token
      });

      // Attempt to initialize the base
      addLog(`Initializing base with ID: ${formData.baseId}`);
      const base = Airtable.base(formData.baseId);
      
      // If we get here, base initialization worked
      addLog('Base initialization successful');
      return { success: true, base };
    } catch (error: any) {
      addLog(`Base initialization failed: ${error.message}`, true);
      console.error('Base initialization error:', error);
      return { success: false, error };
    }
  };

  const testTableAccess = async () => {
    const baseResult = await testBaseConnection();
    if (!baseResult.success) return;
    
    try {
      const base = baseResult.base;
      addLog(`Testing table: "${formData.tableName}"`);
      
      // Test if the table exists by trying to select from it
      addLog('Attempting to query table...');
      const table = base(formData.tableName);
      
      // Try to get just one record to test table access
      const records = await table.select({ maxRecords: 1 }).firstPage();
      
      addLog(`Table query successful. Found ${records.length} record(s).`);
      
      if (records.length > 0) {
        addLog('First record ID: ' + records[0].id);
        const fields = Object.keys(records[0].fields);
        addLog(`Fields found: ${fields.join(', ')}`);
        return { success: true, records };
      } else {
        addLog('Table exists but contains no records');
        return { success: true, records: [] };
      }
    } catch (error: any) {
      addLog(`Table access failed: ${error.message}`, true);
      console.error('Table access error:', error);
      
      // Special handling for common errors
      if (error.message.includes('not find') || error.message.includes('could not be found')) {
        addLog(`It looks like table "${formData.tableName}" doesn't exist or you don't have access to it.`, true);
        addLog('Double-check your table name (it\'s case-sensitive)', true);
      }
      
      return { success: false, error };
    }
  };

  const testRecordAccess = async () => {
    const tableResult = await testTableAccess();
    if (!tableResult?.success || !tableResult.records || tableResult.records.length === 0) return;
    
    try {
      const record = tableResult.records[0];
      addLog('Testing record field access...');
      
      // Test different field access methods
      const fields = Object.keys(record.fields);
      
      for (const field of fields) {
        try {
          const valueByDot = record.fields[field];
          const valueByGet = typeof record.get === 'function' ? record.get(field) : 'get() not available';
          
          addLog(`Field "${field}": 
- By direct access: ${JSON.stringify(valueByDot)}
- By get() method: ${JSON.stringify(valueByGet)}`);
        } catch (err: any) {
          addLog(`Error accessing field "${field}": ${err.message}`, true);
        }
      }
      
      // Look specifically for expected fields
      const expectedFields = ['Title', 'Date', 'Location', 'Description'];
      for (const field of expectedFields) {
        if (fields.includes(field)) {
          addLog(`Found expected field: ${field}`);
        } else if (fields.includes(field.toLowerCase())) {
          addLog(`Caution: Found field "${field.toLowerCase()}" but your code may be looking for "${field}"`, true);
        } else {
          addLog(`Missing expected field: ${field}`, true);
        }
      }
      
      return { success: true };
    } catch (error: any) {
      addLog(`Record access failed: ${error.message}`, true);
      console.error('Record access error:', error);
      return { success: false, error };
    }
  };

  const runTest = async () => {
    clearLog();
    setIsRunning(true);
    
    try {
      addLog('Starting Airtable debug test');
      addLog(`Auth token: ${formData.token ? '✓ Present (first 4 chars: ' + formData.token.substring(0, 4) + '...)' : '✗ Missing'}`);
      
      switch (debugMode) {
        case 'base':
          await testBaseConnection();
          break;
        case 'table':
          await testTableAccess();
          break;
        case 'record':
          await testRecordAccess();
          break;
      }
      
      addLog('Test completed');
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`, true);
      console.error('Debug test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Airtable Deep Debugger</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2">Personal Access Token</label>
          <input
            type="password"
            name="token"
            value={formData.token}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="pat_xxxxxxxxxxxx"
          />
        </div>
        
        <div>
          <label className="block mb-2">Base ID</label>
          <input
            type="text"
            name="baseId"
            value={formData.baseId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="appXXXXXXXXXXXX"
          />
        </div>
        
        <div>
          <label className="block mb-2">Table Name</label>
          <input
            type="text"
            name="tableName"
            value={formData.tableName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Events"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2">Test Level</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="base"
              checked={debugMode === 'base'}
              onChange={() => setDebugMode('base')}
              className="mr-2"
            />
            Base connection only
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="table"
              checked={debugMode === 'table'}
              onChange={() => setDebugMode('table')}
              className="mr-2"
            />
            Table access
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="record"
              checked={debugMode === 'record'}
              onChange={() => setDebugMode('record')}
              className="mr-2"
            />
            Record field access
          </label>
        </div>
      </div>
      
      <div className="mb-6">
        <button
          onClick={runTest}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isRunning ? 'Running Test...' : 'Run Diagnostics'}
        </button>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Debug Log</h3>
        <div className="bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-96 font-mono text-sm">
          {log.length ? (
            log.map((entry, i) => (
              <div key={i} className={entry.includes('❌') ? 'text-red-400' : ''}>
                {entry}
              </div>
            ))
          ) : (
            <p>No logs yet. Run test to see results.</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>This tool directly tests Airtable connection at different levels.</p>
        <p>Common issues:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Personal Access Token needs data.records:read and data.records:write scopes</li>
          <li>Base ID must start with "app" and be from the URL when viewing your base</li>
          <li>Table names are case-sensitive and must match exactly</li>
          <li>Field names are also case-sensitive (Title ≠ title)</li>
        </ul>
      </div>
    </div>
  );
};

export default AirtableDeepDebugger;