import Airtable from 'airtable';

// Debug logging for Airtable connection troubleshooting
console.log('Airtable service initializing...');

// Check for access token (new method) vs API key (legacy method)
const accessToken = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN;
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

// Log env vars presence (not values for security)
const envVars = {
  accessToken: !!accessToken,
  apiKey: !!apiKey,
  baseId: !!import.meta.env.VITE_AIRTABLE_BASE_ID,
  subscribersTable: !!import.meta.env.VITE_AIRTABLE_SUBSCRIBERS_TABLE,
  eventsTable: !!import.meta.env.VITE_AIRTABLE_EVENTS_TABLE,
  contentTable: !!import.meta.env.VITE_AIRTABLE_CONTENT_TABLE,
};

console.log('Environment variables present:', envVars);

// Log actual table names for debugging
console.log('Airtable table names:', {
  subscribersTable: import.meta.env.VITE_AIRTABLE_SUBSCRIBERS_TABLE,
  eventsTable: import.meta.env.VITE_AIRTABLE_EVENTS_TABLE,
  contentTable: import.meta.env.VITE_AIRTABLE_CONTENT_TABLE,
});

// Initialize Airtable with authorization (preferring access token over API key)
const authToken = accessToken || apiKey || 'missing_auth_token';
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || 'missing_base_id';

console.log('Using base ID:', baseId);
console.log('Using auth method:', accessToken ? 'Access Token' : apiKey ? 'API Key' : 'None');

// Initialize Airtable with authorization
let base;
try {
  if (accessToken) {
    // New Personal Access Token method
    Airtable.configure({
      apiKey: accessToken,
    });
    base = Airtable.base(baseId);
    console.log('Airtable base initialized with Personal Access Token');
  } else {
    // Legacy API key method
    base = new Airtable({ apiKey: authToken }).base(baseId);
    console.log('Airtable base initialized with API Key');
  }
} catch (error) {
  console.error('Failed to initialize Airtable base:', error);
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

// Test connection to each table and log results
const testAirtableConnection = async () => {
  console.log('Testing Airtable connection...');
  
  try {
    console.log('Testing Subscribers table...');
    const subscribersResult = await subscribersTable.select({ maxRecords: 1 }).firstPage();
    console.log('Subscribers table connection successful:', !!subscribersResult);
  } catch (error) {
    console.error('Error connecting to Subscribers table:', error);
  }
  
  try {
    console.log('Testing Events table...');
    const eventsResult = await eventsTable.select({ maxRecords: 1 }).firstPage();
    console.log('Events table connection successful:', !!eventsResult);
    console.log('First event (if any):', eventsResult[0]?.fields);
  } catch (error) {
    console.error('Error connecting to Events table:', error);
  }
  
  try {
    console.log('Testing Site Content table...');
    const contentResult = await contentTable.select({ maxRecords: 1 }).firstPage();
    console.log('Content table connection successful:', !!contentResult);
    console.log('First content item (if any):', contentResult[0]?.fields);
  } catch (error) {
    console.error('Error connecting to Content table:', error);
  }
};

// Run the test when the service initializes
testAirtableConnection();

// Function to add a new subscriber
export const addSubscriber = async (email: string, name?: string) => {
  console.log('Adding subscriber:', { email });
  try {
    // Check if email already exists
    const existingRecords = await subscribersTable.select({
      filterByFormula: `{Email} = '${email}'`
    }).firstPage();
    
    if (existingRecords.length > 0) {
      console.log('Email already exists');
      return { success: false, error: 'Email already exists' };
    }
    
    const result = await subscribersTable.create([
      {
        fields: {
          Email: email,
          Name: name || '',
          'Signup Date': new Date().toISOString(),
          Source: 'Website',
          Active: true,
        },
      },
    ]);
    console.log('Subscriber added successfully');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return { success: false, error };
  }
};

// Function to get all events
export const getEvents = async (featured = false) => {
  console.log('Fetching events, featured =', featured);
  try {
    let filterFormula = '';
    if (featured) {
      filterFormula = '{Featured} = TRUE()';
    }
    
    console.log(`Using table name: ${eventsTableName}`);
    const records = await eventsTable.select({
      filterByFormula: filterFormula,
      sort: [{ field: 'Date', direction: 'asc' }],
    }).all();
    
    console.log(`Found ${records.length} events`);
    
    if (records.length > 0) {
      // Log the first event's fields for debugging
      console.log('First event fields:', records[0].fields);
    }
    
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
          console.error('Error parsing event record:', err, record);
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
    console.error('Error fetching events:', error);
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
  console.log('Fetching site content');
  try {
    console.log(`Using content table name: ${contentTableName}`);
    const records = await contentTable.select().all();
    console.log(`Found ${records.length} content items`);
    
    if (records.length > 0) {
      // Log the first content item for debugging
      console.log('First content item fields:', records[0].fields);
    }
    
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
        console.error('Error parsing content record:', err, record);
        return acc;
      }
    }, {} as Record<string, string>);
    
    console.log('Parsed content keys:', Object.keys(content));
    
    return { success: true, data: content };
  } catch (error) {
    console.error('Error fetching site content:', error);
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