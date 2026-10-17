export function Legend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-sm bg-[#cccccc]"></div>
        <span>Non visité</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-sm bg-amber-500"></div>
        <span>Plage de recherche</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
        <span>Élément courant</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
        <span>Trouvé</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-sm bg-red-500"></div>
        <span>Non trouvé</span>
      </div>
    </div>
  );
}
