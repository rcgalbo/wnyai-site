import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';

interface DebugPanelProps {
  apiKey: string;
  accessToken: string;
  baseId: string;
  eventsTable: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ apiKey, accessToken, baseId, eventsTable }) => {
  const [status, setStatus] = useState<string>('Loading...');
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Testing Airtable connection...');
        
        let base;
        // Use correct authentication method
        if (accessToken) {
          Airtable.configure({ apiKey: accessToken });
          base = Airtable.base(baseId);
          setStatus('Airtable configured with Personal Access Token, querying events...');
        } else if (apiKey) {
          base = new Airtable({ apiKey }).base(baseId);
          setStatus('Airtable configured with API Key, querying events...');
        } else {
          throw new Error('No authentication credentials provided');
        }
        
        // Try to fetch records from the Events table
        const fetchedRecords = await base(eventsTable).select({}).firstPage();
        
        setStatus(`Success! Found ${fetchedRecords.length} events.`);
        setRecords(fetchedRecords);
      } catch (err: any) {
        console.error('Debug panel error:', err);
        setStatus('Connection failed');
        setError(err.message || 'Unknown error');
      }
    };

    testConnection();
  }, [apiKey, accessToken, baseId, eventsTable]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50"
      >
        Show Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 bg-white border border-gray-300 shadow-lg rounded-tl-lg p-4 m-4 max-w-lg max-h-[80vh] overflow-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Airtable Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="mb-4">
        <p><strong>Status:</strong> <span className={error ? 'text-red-500' : 'text-green-500'}>{status}</span></p>
        <p><strong>Auth:</strong> {accessToken ? 'Personal Access Token' : apiKey ? 'API Key' : 'None'}</p>
        <p><strong>Base ID:</strong> {baseId ? `${baseId.substring(0, 5)}...` : 'Not set'}</p>
        <p><strong>Events Table:</strong> {eventsTable || 'Not set'}</p>
        {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
      </div>
      
      {records.length > 0 ? (
        <div>
          <h4 className="font-bold mb-2">Found Events:</h4>
          {records.map((record, index) => (
            <div key={index} className="border-t border-gray-200 pt-2 mb-2">
              <p><strong>ID:</strong> {record.id}</p>
              <p><strong>Fields:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(record.fields, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <p>No records found</p>
      )}
    </div>
  );
};

export default DebugPanel;