// Fonction de hachage simple
export function hashFunction(key: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i)) % size;
  }
  return hash;
}
