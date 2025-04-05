import React from 'react';
import AirtableDebugger from './components/AirtableDebugger';
import AirtableDeepDebugger from './components/AirtableDeepDebugger';

function Debug() {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || '';
  const accessToken = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || '';
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
  
  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">WNY AI Debug Panel</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
        <div className="bg-white shadow rounded-lg p-4">
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="font-medium mr-2">Access Token:</span> 
              <span className={accessToken ? "text-green-600" : "text-red-600"}>
                {accessToken ? "✓ Present" : "✗ Missing"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Legacy API Key:</span> 
              <span className={apiKey ? "text-green-600" : "text-red-600"}>
                {apiKey ? "✓ Present" : "✗ Missing"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Base ID:</span>
              <span className={baseId ? "text-green-600" : "text-red-600"}>
                {baseId ? "✓ Present" : "✗ Missing"}
              </span>
              {baseId && <span className="ml-2 text-gray-500 text-sm">
                {baseId.substring(0, 5)}...{baseId.substring(baseId.length - 5)}
              </span>}
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Subscribers Table:</span>
              <span className={import.meta.env.VITE_AIRTABLE_SUBSCRIBERS_TABLE ? "text-green-600" : "text-red-600"}>
                {import.meta.env.VITE_AIRTABLE_SUBSCRIBERS_TABLE || "✗ Missing"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Events Table:</span>
              <span className={import.meta.env.VITE_AIRTABLE_EVENTS_TABLE ? "text-green-600" : "text-red-600"}>
                {import.meta.env.VITE_AIRTABLE_EVENTS_TABLE || "✗ Missing"}
              </span>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Content Table:</span>
              <span className={import.meta.env.VITE_AIRTABLE_CONTENT_TABLE ? "text-green-600" : "text-red-600"}>
                {import.meta.env.VITE_AIRTABLE_CONTENT_TABLE || "✗ Missing"}
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Advanced Airtable Debugger</h2>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-amber-800">
            This tool helps identify specific issues with your Airtable connection. The built-in debugger works step-by-step
            to isolate where the connection is failing and provide specific guidance.
          </p>
        </div>
        <AirtableDeepDebugger />
      </div>
      
      <div className="mt-8 bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Base ID Format</strong>: Should start with "app" and be the first part of the URL when viewing your base</li>
          <li><strong>Personal Access Token</strong>: Create at https://airtable.com/account under "Developer Hub"</li>
          <li><strong>Table Names</strong>: Case-sensitive and must match exactly what's in Airtable</li>
          <li><strong>Field Names</strong>: Also case-sensitive (e.g., "Title" vs "title")</li>
          <li><strong>Common Errors</strong>:
            <ul className="list-disc pl-5 mt-2">
              <li>"Could not find what you're looking for" - Incorrect Base ID or Table name</li>
              <li>"Authentication required" - Invalid or missing access token</li>
              <li>"Could not find field X" - Case mismatch in field names</li>
            </ul>
          </li>
        </ul>
      </div>
      
      <div className="mt-8 text-center">
        <a 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded inline-block"
        >
          Return to Main Site
        </a>
      </div>
    </div>
  );
}

export default Debug;