import Airtable from 'airtable';

// Check for access token (new method) vs API key (legacy method)
const accessToken = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN;
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

// Initialize Airtable with authorization (preferring access token over API key)
const authToken = accessToken || apiKey || 'missing_auth_token';
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || 'missing_base_id';

// Initialize Airtable with authorization
let base;
try {
  if (accessToken) {
    // New Personal Access Token method
    Airtable.configure({
      apiKey: accessToken,
    });
    base = Airtable.base(baseId);
  } else {
    // Legacy API key method
    base = new Airtable({ apiKey: authToken }).base(baseId);
  }
} catch (error) {
  // Provide dummy base for development/testing
  base = {
    // @ts-ignore - Mock for testing
    Subscribers: () => ({ select: () => ({ firstPage: () => Promise.resolve([]) }) }),
    // @ts-ignore - Mock for testing
    Events: () => ({ select: () => ({ all: () => Promise.resolve([]) }) }),
    // @ts-ignore - Mock for testing
    'Site Content': () => ({ select: () => ({ all: () => Promise.resolve([]) }) }),
  };
}

// Table names with fallbacks
const subscribersTableName = import.meta.env.VITE_AIRTABLE_SUBSCRIBERS_TABLE || 'Subscribers';
const eventsTableName = import.meta.env.VITE_AIRTABLE_EVENTS_TABLE || 'Events';
const contentTableName = import.meta.env.VITE_AIRTABLE_CONTENT_TABLE || 'Site Content';

// Tables
const subscribersTable = base(subscribersTableName);
const eventsTable = base(eventsTableName);
const contentTable = base(contentTableName);

// No test connection in production

// Function to add a new subscriber
export const addSubscriber = async (email: string, name?: string) => {
  try {
    // First check if email already exists
    try {
      const existingRecords = await subscribersTable.select({
        filterByFormula: `{Email} = '${email}'`
      }).firstPage();
      
      if (existingRecords.length > 0) {
        return { success: false, error: 'Email already exists' };
      }
    } catch (err) {
      // Continue even if check fails
    }
    
    // Try to get existing records to learn schema
    try {
      const existingRecords = await subscribersTable.select({ maxRecords: 1 }).firstPage();
      
      if (existingRecords.length > 0 && existingRecords[0]?.fields) {
        const fields = Object.keys(existingRecords[0].fields);
        
        // Find field names by case-insensitive matching
        const exactFieldNames = {
          email: fields.find(f => f.toLowerCase().includes('email')),
          date: fields.find(f => f.toLowerCase().includes('date')),
          source: fields.find(f => f.toLowerCase().includes('source')),
          name: fields.find(f => f.toLowerCase().includes('name')),
          active: fields.find(f => f.toLowerCase().includes('active')),
        };
        
        // Build a record with the exact field names
        const fieldsToCreate: Record<string, any> = {};
        if (exactFieldNames.email) fieldsToCreate[exactFieldNames.email] = email;
        if (exactFieldNames.date) fieldsToCreate[exactFieldNames.date] = new Date().toISOString();
        if (exactFieldNames.source) fieldsToCreate[exactFieldNames.source] = 'Website';
        if (exactFieldNames.active) fieldsToCreate[exactFieldNames.active] = true;
        
        const result = await subscribersTable.create([{ fields: fieldsToCreate }]);
        return { success: true, data: result };
      }
    } catch (err) {
      // If schema detection fails, continue with standard pattern
    }
    
    // If we couldn't determine field names, try standard patterns
    const dateValue = new Date().toISOString();
    const sourceValue = 'Website';
    
    // Define field patterns to try
    const attempts = [
      // Standard field names
      {
        fields: {
          'Email': email,
          'Signup Date': dateValue,
          'Source': sourceValue,
          'Active': true
        }
      },
      // Lowercase field names
      {
        fields: {
          'email': email,
          'signup date': dateValue,
          'source': sourceValue,
          'active': true
        }
      },
      // Single word field names
      {
        fields: {
          'Email': email,
          'Date': dateValue,
          'Source': sourceValue,
          'Active': true
        }
      },
      // Just email as fallback
      {
        fields: {
          'Email': email
        }
      },
      // Email lowercase as last resort
      {
        fields: {
          'email': email
        }
      }
    ];
    
    // Try each pattern
    for (const attempt of attempts) {
      try {
        const result = await subscribersTable.create([{ fields: attempt.fields }]);
        return { success: true, data: result };
      } catch (err) {
        // Continue to next attempt
      }
    }
    
    // If all attempts fail
    return { 
      success: false, 
      error: 'Unable to add subscriber',
      message: 'Unable to subscribe. Please try again or contact us directly.'
    };
  } catch (error: any) {
    // Final error handler
    const errorMessage = error.message || 'Unknown error';
    return { 
      success: false, 
      error: errorMessage,
      message: 'Unable to subscribe. Please try again or contact us directly.'
    };
  }
};

// Function to get all events
export const getEvents = async (featured = false) => {
  try {
    let filterFormula = '';
    if (featured) {
      filterFormula = '{Featured} = TRUE()';
    }
    
    const records = await eventsTable.select({
      filterByFormula: filterFormula,
      sort: [{ field: 'Date', direction: 'asc' }],
    }).all();
    
    return {
      success: true,
      data: records.map(record => {
        try {
          return {
            id: record.id,
            title: record.get('Title') || record.fields['Title'] || 'Untitled Event',
            date: record.get('Date') || record.fields['Date'] || new Date().toISOString(),
            time: record.get('Date') || record.fields['Date']
              ? new Date(record.get('Date') as string || record.fields['Date']).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '12:00 PM',
            location: record.get('Location') || record.fields['Location'] || 'TBD',
            description: record.get('Description') || record.fields['Description'] || 'No description available',
            registrationLink: record.get('Registration Link') || record.fields['Registration Link'],
            virtualEvent: record.get('Virtual Event') || record.fields['Virtual Event'],
          };
        } catch (err) {
          return {
            id: record.id,
            title: 'Error parsing event',
            date: new Date().toISOString(),
            time: '12:00 PM',
            location: 'Error',
            description: 'There was an error parsing this event from Airtable',
          };
        }
      }),
    };
  } catch (error) {
    return { 
      success: false, 
      error,
      // Provide fallback data for development/testing
      data: [
        {
          id: 'fallback1',
          title: 'Sample Event (Fallback)',
          date: new Date().toISOString(),
          time: '6:00 PM',
          location: 'Buffalo, NY',
          description: 'This is a fallback event shown when Airtable connection fails.',
        }
      ]
    };
  }
};

// Function to get site content
export const getSiteContent = async () => {
  try {
    const records = await contentTable.select().all();
    
    // Convert to key-value object
    const content = records.reduce((acc, record) => {
      try {
        const key = record.get('Content Key') || record.fields['Content Key'];
        const value = record.get('Content Value') || record.fields['Content Value'];
        if (key) {
          return { ...acc, [key]: value };
        }
        return acc;
      } catch (err) {
        return acc;
      }
    }, {} as Record<string, string>);
    
    return { success: true, data: content };
  } catch (error) {
    return { 
      success: false, 
      error,
      // Provide fallback data for development/testing
      data: {
        discord_link: 'https://discord.gg/example',
        twitter_link: 'https://twitter.com/example',
        linkedin_link: 'https://linkedin.com/company/example',
        github_link: 'https://github.com/example',
        privacy_policy: 'This is a fallback privacy policy.',
        terms_of_service: 'These are fallback terms of service.',
      }
    };
  }
};