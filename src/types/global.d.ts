// Extend NodeJS.Global to include a designs property for in-memory design storage

declare global {
  var designs: Map<string, any> | undefined;
}

export {};
