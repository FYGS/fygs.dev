"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  File,
  FileCode,
  FilePlus,
  FolderOpen,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../_stores/editor-store";

export function FileExplorer() {
  const {
    files,
    activeFileId,
    setActiveFile,
    addFile,
    removeFile,
    setEntryPoint,
    // getEntryPointFile, // Commented out as it's not used
    // updatePackageJson, // Commented out as it's not used
  } = useEditorStore();

  // const entryPointFile = getEntryPointFile(); // Commented out as it's not used
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "js":
        return <FileCode className="w-4 h-4 text-yellow-500" />;
      case "ts":
        return <FileCode className="w-4 h-4 text-blue-500" />;
      case "jsx":
      case "tsx":
        return <FileCode className="w-4 h-4 text-cyan-500" />;
      case "html":
        return <FileCode className="w-4 h-4 text-orange-500" />;
      case "css":
        return <FileCode className="w-4 h-4 text-purple-500" />;
      case "json":
        return <FileCode className="w-4 h-4 text-green-500" />;
      case "md":
        return <FileCode className="w-4 h-4 text-gray-500" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error("File name cannot be empty");
      return;
    }

    // Determine language based on file extension
    const extension = newFileName.split(".").pop()?.toLowerCase();
    let language = "text";

    switch (extension) {
      case "js":
        language = "javascript";
        break;
      case "ts":
        language = "typescript";
        break;
      case "jsx":
        language = "javascript";
        break;
      case "tsx":
        language = "typescript";
        break;
      case "html":
        language = "html";
        break;
      case "css":
        language = "css";
        break;
      case "json":
        language = "json";
        break;
      case "md":
        language = "markdown";
        break;
    }

    // Check if this is a package.json file
    const isPackageJson = newFileName === "package.json";

    // Create default content for package.json
    let content = "";
    if (isPackageJson) {
      content = JSON.stringify(
        {
          name: "playground-project",
          version: "1.0.0",
          description: "Playground project",
          main: "index.js",
          dependencies: {},
          scripts: {
            start: "node index.js",
          },
        },
        null,
        2
      );
    }

    const newFileId = addFile(newFileName, content, language);
    setActiveFile(newFileId);
    setNewFileName("");
    setIsCreatingFile(false);

    toast.success("File Created", {
      description: `${newFileName} has been created`,
    });
  };

  const handleDeleteFile = (id: string, name: string) => {
    removeFile(id);

    toast.success("File Deleted", {
      description: `${name} has been deleted`,
    });
  };

  const handleSetEntryPoint = (id: string, name: string) => {
    setEntryPoint(id);

    toast.success("Entry Point Set", {
      description: `${name} is now the entry point`,
    });
  };

  return (
    <div className="flex flex-col h-full border-r border-border/40 overflow-hidden full-height-container">
      <div className="flex items-center justify-between p-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Files</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCreatingFile(true)}
              >
                <FilePlus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create new file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isCreatingFile && (
        <div className="p-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFile();
                } else if (e.key === "Escape") {
                  setIsCreatingFile(false);
                  setNewFileName("");
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setIsCreatingFile(false);
                setNewFileName("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0 scrollable-container">
        <div className="p-1">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center justify-between px-2 py-1 rounded-md cursor-pointer text-sm group",
                activeFileId === file.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              )}
              onClick={() => setActiveFile(file.id)}
            >
              <div className="flex items-center gap-2 truncate">
                {file.isEntryPoint && (
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
                {getFileIcon(file.name)}
                <span className="truncate">{file.name}</span>
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100">
                {/* Entry point button */}
                {!file.isEntryPoint && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetEntryPoint(file.id, file.name);
                          }}
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set as entry point</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Delete button */}
                {files.length > 1 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id, file.name);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
