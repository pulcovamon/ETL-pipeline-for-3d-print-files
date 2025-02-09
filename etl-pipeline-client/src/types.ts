export interface Folder {
    name: string;
    children: Folder[];
    folder: boolean,
    path: string[];
    category: string;
  }
  