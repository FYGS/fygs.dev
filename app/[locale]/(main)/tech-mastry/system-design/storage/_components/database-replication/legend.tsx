export function Legend() {
  return (
    <div className="absolute bottom-2 right-2 bg-slate-900/80 p-2 rounded-md border text-xs">
      <div className="font-medium mb-1">
        Cliquez sur un nœud pour simuler une panne
      </div>
      <div className="flex items-center gap-1 mb-1">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span>Écriture</span>
        <div className="w-3 h-3 rounded-full bg-blue-500 ml-2"></div>
        <span>Lecture</span>
        <div className="w-3 h-3 rounded-full bg-amber-500 ml-2"></div>
        <span>Synchronisation</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
        <span>Master</span>
        <div className="w-3 h-3 rounded-full bg-blue-500 ml-2"></div>
        <span>Slave</span>
      </div>
    </div>
  );
}
