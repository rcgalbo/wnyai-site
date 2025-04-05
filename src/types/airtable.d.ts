declare module 'airtable' {
  interface FieldSet {
    [key: string]: any;
  }

  interface Record<TFields extends FieldSet> {
    id: string;
    fields: TFields;
    get(columnName: string): any;
  }

  interface SelectOptions<TFields> {
    fields?: Array<keyof TFields>;
    filterByFormula?: string;
    maxRecords?: number;
    pageSize?: number;
    sort?: Array<{
      field: keyof TFields | string;
      direction?: 'asc' | 'desc';
    }>;
    view?: string;
  }

  interface Base {
    (tableName: string): Table<any>;
  }

  interface Table<TFields extends FieldSet> {
    create(
      records: Array<{ fields: Partial<TFields> }>,
      callback?: (error: any, records: Array<Record<TFields>>) => void
    ): Promise<Array<Record<TFields>>>;

    select(
      options?: SelectOptions<TFields>
    ): Query<TFields>;

    find(
      id: string,
      callback?: (error: any, record: Record<TFields>) => void
    ): Promise<Record<TFields>>;

    update(
      records: Array<{
        id: string;
        fields: Partial<TFields>;
      }>,
      callback?: (error: any, records: Array<Record<TFields>>) => void
    ): Promise<Array<Record<TFields>>>;

    destroy(
      ids: string[],
      callback?: (error: any, records: Array<Record<TFields>>) => void
    ): Promise<Array<Record<TFields>>>;
  }

  interface Query<TFields extends FieldSet> {
    firstPage(
      callback?: (error: any, records: Array<Record<TFields>>) => void
    ): Promise<Array<Record<TFields>>>;

    eachPage(
      pageCallback: (
        records: Array<Record<TFields>>,
        fetchNextPage: () => void
      ) => void,
      doneCallback?: (error?: any) => void
    ): void;

    all(
      callback?: (error: any, records: Array<Record<TFields>>) => void
    ): Promise<Array<Record<TFields>>>;
  }

  interface AirtableOptions {
    apiKey?: string;
    endpointUrl?: string;
    apiVersion?: string;
    allowUnauthorizedSsl?: boolean;
    noRetryIfRateLimited?: boolean;
    requestTimeout?: number;
  }

  export default class Airtable {
    constructor(options?: AirtableOptions);
    configure(options: AirtableOptions): void;
    base(baseId: string): Base;
  }
}