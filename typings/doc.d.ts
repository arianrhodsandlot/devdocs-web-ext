interface Doc {
  name: string;
  slug: string;
  type: string;
  links: {
    home: string;
    code: string;
  };
  version: string;
  release: string;
  mtime: number;
  db_size: number;
}

interface Entry {
  name: string;
  path: string;
  type: string;
}

interface Type {
  name: string;
  count: number;
  slug: string;
}

interface Index {
  entries: Entry[];
  types: Type[];
}
