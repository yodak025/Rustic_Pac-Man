import type { Component } from './components';

export interface Entity {
  id: string;
  components: Record<string, Component>;
  actions: Record<string, (...args: unknown[]) => unknown>; 
}