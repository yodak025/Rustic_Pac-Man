export interface Entity {
  id: string;
  components: Record<string, any>;
  actions: Record<string, (...args:any[]) => any>; 
}