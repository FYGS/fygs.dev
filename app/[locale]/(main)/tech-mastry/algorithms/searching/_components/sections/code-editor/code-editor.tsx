"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Editor, { Monaco } from "@monaco-editor/react";
import confetti from "canvas-confetti";
import { Code, Play, RefreshCw, Sparkles } from "lucide-react";
import { editor } from "monaco-editor";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useRef, useState } from "react";

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  title?: string;
  readOnly?: boolean;
  height?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
}

export function CodeEditor({
  initialCode,
  language = "javascript",
  title = "Éditeur de Code",
  readOnly = false,
  height = "300px",
  onCodeChange,
  onRun,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("code");
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Fonction pour formater le code
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();

      // Lancer des confettis
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Fonction pour exécuter le code
  const runCode = async () => {
    if (!onRun) {
      try {
        setIsRunning(true);
        setOutput("");
        setActiveTab("output");

        // Capturer console.log
        const originalConsoleLog = console.log;
        const logs: string[] = [];

        console.log = (...args) => {
          logs.push(
            args
              .map((arg) =>
                typeof arg === "object"
                  ? JSON.stringify(arg, null, 2)
                  : String(arg),
              )
              .join(" "),
          );
          originalConsoleLog(...args);
        };

        // Exécuter le code
        try {
          const result = new Function(code)();
          if (result !== undefined) {
            logs.push(`Résultat: ${result}`);
          }
          setOutput(logs.join("\n"));
        } catch (error) {
          if (error instanceof Error) {
            setOutput(`Erreur: ${error.message}`);
          } else {
            setOutput(`Une erreur s'est produite: ${String(error)}`);
          }
        }

        // Restaurer console.log
        console.log = originalConsoleLog;
      } finally {
        setIsRunning(false);
      }
    } else {
      setIsRunning(true);
      try {
        await onRun(code);
      } finally {
        setIsRunning(false);
      }
    }
  };

  // Fonction pour réinitialiser le code
  const resetCode = () => {
    setCode(initialCode);
    setOutput("");
  };

  // Fonction pour gérer le changement de code
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onCodeChange?.(value);
    }
  };

  // Fonction pour configurer l'éditeur
  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configurer les thèmes
    monaco.editor.defineTheme("darkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e2e",
      },
    });

    monaco.editor.defineTheme("lightTheme", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    });

    // Appliquer le thème en fonction du thème de l'application
    monaco.editor.setTheme(theme === "dark" ? "darkTheme" : "lightTheme");
  };

  // Mettre à jour le thème de l'éditeur lorsque le thème de l'application change
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(
        theme === "dark" ? "darkTheme" : "lightTheme",
      );
    }
  }, [theme]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Code className="w-5 h-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="output">Résultat</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="code" className="m-0">
              <div className="relative" style={{ height }}>
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={handleCodeChange}
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    readOnly,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                  onMount={handleEditorDidMount}
                />
              </div>
            </TabsContent>
            <TabsContent value="output" className="m-0">
              <div
                className="p-4 font-mono text-sm overflow-auto bg-muted/30"
                style={{ height, whiteSpace: "pre-wrap" }}
              >
                {isRunning ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin mr-2">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <span>Exécution en cours...</span>
                  </div>
                ) : output ? (
                  output
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Play className="h-8 w-8 mb-2 opacity-50" />
                    <p>
                      Cliquez sur &quot;Exécuter&quot; pour voir le résultat
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
            disabled={isRunning}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={formatCode}
            disabled={isRunning || readOnly}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Formater
          </Button>
        </div>
        <Button onClick={runCode} disabled={isRunning || readOnly}>
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Exécution...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Exécuter
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
