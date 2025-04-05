import Airtable from 'airtable';

/**
 * This is a simple direct test script for Airtable connection.
 * It bypasses the regular service layer and makes direct Airtable calls.
 * 
 * To run this test, import and call the testAirtableDirectly function
 * from your component or from the browser console.
 */

export const testAirtableDirectly = (apiKey: string, baseId: string, tableName: string) => {
  try {
    // Initialize Airtable directly
    const base = new Airtable({ apiKey }).base(baseId);
    
    // Attempt to query the table
    return base(tableName).select({}).firstPage()
      .then(records => {
        return {
          success: true,
          recordCount: records.length,
          records: records.map(r => ({ id: r.id, fields: r.fields }))
        };
      })
      .catch(error => {
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      });
  } catch (error: any) {
    return Promise.resolve({
      success: false,
      error: error.message || 'Failed to initialize Airtable'
    });
  }
};

// Helper function to diagnose field access issues
export const testRecordAccess = (records: any[]) => {
  if (!records || records.length === 0) {
    return { success: false, error: 'No records to test' };
  }
  
  const record = records[0];
  
  try {
    // Test different ways of accessing fields
    const fields = Object.keys(record.fields);
    const accessResults: Record<string, any> = {};
    
    // Check if get method works
    const hasGetMethod = typeof record.get === 'function';
    
    // Test specific field access patterns for event fields
    const fieldTests = [
      'Title', 'title', 'Date', 'date', 
      'Location', 'location', 'Description', 'description'
    ];
    
    const fieldResults: Record<string, any> = {};
    fieldTests.forEach(field => {
      try {
        fieldResults[field] = record.fields[field];
      } catch (err) {
        fieldResults[field] = null;
      }
    });
    
    return {
      success: true,
      recordId: record.id,
      fields,
      hasGetMethod,
      fieldResults
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Unknown error during field access test' 
    };
  }
};