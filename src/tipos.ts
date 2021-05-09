import {nota} from './nota';
export type RequestType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  user: string;
  title?: string;
  body?: string;
  color?: string;
}
export type ResponseType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  success: boolean;
  notes?: nota[];
  error?: string;
}
