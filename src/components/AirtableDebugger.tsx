import React, { useState } from 'react';
import { testAirtableDirectly, testRecordAccess } from '../services/directAirtableTest';

interface Props {
  apiKey: string;
  baseId: string;
}

const AirtableDebugger: React.FC<Props> = ({ apiKey, baseId }) => {
  const [tableName, setTableName] = useState('Events');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await testAirtableDirectly(apiKey, baseId, tableName);
      setResults(result);
      
      if (result.success && result.records && result.records.length > 0) {
        testRecordAccess(result.records);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error running test:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Airtable Direct Connection Test</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Table to Test:</label>
        <select 
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Events">Events</option>
          <option value="Subscribers">Subscribers</option>
          <option value="Site Content">Site Content</option>
        </select>
      </div>
      
      <div className="mb-6">
        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Running Test...' : 'Test Connection'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {results && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">
            {results.success ? '✅ Connection Successful' : '❌ Connection Failed'}
          </h3>
          
          {results.success && (
            <>
              <p className="mb-2">Found {results.recordCount} records in "{tableName}" table.</p>
              
              {results.records && results.records.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">First Record:</h4>
                  <div className="bg-gray-100 p-3 rounded overflow-auto max-h-64">
                    <pre className="text-xs">{JSON.stringify(results.records[0], null, 2)}</pre>
                  </div>
                  
                  <h4 className="font-semibold mt-4 mb-2">Field Names:</h4>
                  <ul className="list-disc pl-5">
                    {Object.keys(results.records[0].fields).map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          
          {!results.success && (
            <div className="bg-red-50 p-3 rounded">
              <p className="text-red-700">{results.error}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Check the browser console for additional debugging information.</p>
      </div>
    </div>
  );
};

export default AirtableDebugger;