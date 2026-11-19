import { createContext } from 'react';

export type DataListVariant = 'inline' | 'stacked' | 'grid';

export const DataListContext = createContext<DataListVariant>('inline');
