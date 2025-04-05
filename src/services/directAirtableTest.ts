import Airtable from 'airtable';

/**
 * This is a simple direct test script for Airtable connection.
 * It bypasses the regular service layer and makes direct Airtable calls.
 * 
 * To run this test, import and call the testAirtableDirectly function
 * from your component or from the browser console.
 */

export const testAirtableDirectly = (apiKey: string, baseId: string, tableName: string) => {
  console.log('=== DIRECT AIRTABLE TEST ===');
  console.log('Testing with:');
  console.log('- API Key:', apiKey ? '✓ Present' : '✗ Missing');
  console.log('- Base ID:', baseId);
  console.log('- Table:', tableName);
  
  try {
    // Initialize Airtable directly
    const base = new Airtable({ apiKey }).base(baseId);
    console.log('Airtable base initialized');
    
    // Attempt to query the table
    return base(tableName).select({}).firstPage()
      .then(records => {
        console.log(`SUCCESS: Found ${records.length} records in ${tableName}`);
        
        if (records.length > 0) {
          console.log('First record ID:', records[0].id);
          console.log('First record fields:', records[0].fields);
          
          // Log field names for debugging
          const fieldNames = Object.keys(records[0].fields);
          console.log('Field names in first record:', fieldNames);
        }
        
        return {
          success: true,
          recordCount: records.length,
          records: records.map(r => ({ id: r.id, fields: r.fields }))
        };
      })
      .catch(error => {
        console.error('ERROR in direct Airtable test:', error);
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      });
  } catch (error: any) {
    console.error('FAILED to initialize Airtable:', error);
    return Promise.resolve({
      success: false,
      error: error.message || 'Failed to initialize Airtable'
    });
  }
};

// Helper function to diagnose field access issues
export const testRecordAccess = (records: any[]) => {
  if (!records || records.length === 0) {
    console.log('No records to test field access');
    return;
  }
  
  const record = records[0];
  console.log('=== FIELD ACCESS TEST ===');
  console.log('Record ID:', record.id);
  
  // Test different ways of accessing fields
  try {
    console.log('Fields object:', record.fields);
    
    // Try accessing with dot notation
    console.log('Dot notation test:');
    for (const key in record.fields) {
      console.log(`- ${key}:`, record.fields[key]);
    }
    
    // Try accessing with get method
    console.log('Get method test:');
    if (typeof record.get === 'function') {
      for (const key in record.fields) {
        console.log(`- ${key}:`, record.get(key));
      }
    } else {
      console.log('Record does not have a get method');
    }
    
    // Test specific field access patterns for event fields
    console.log('Event fields specific test:');
    const fieldTests = [
      'Title', 'title', 'Title:', 'title:', 
      'Date', 'date', 'Location', 'location',
      'Description', 'description'
    ];
    
    fieldTests.forEach(field => {
      try {
        console.log(`- ${field}:`, record.fields[field]);
      } catch (err) {
        console.log(`- ${field}: ERROR`, err);
      }
    });
  } catch (error) {
    console.error('Error during field access test:', error);
  }
};