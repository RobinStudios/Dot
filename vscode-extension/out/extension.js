"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
    const disposable = vscode.commands.registerCommand('aiDesigner.open', () => {
        const panel = vscode.window.createWebviewPanel('aiDesigner', 'AI Graphic Designer', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = getWebviewContent();
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'exportCode':
                    exportToWorkspace(message.code, message.fileName);
                    break;
            }
        }, undefined, context.subscriptions);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function getWebviewContent() {
    try {
        const htmlPath = path.join(__dirname, '..', 'webview-content.html');
        return fs.readFileSync(htmlPath, 'utf8');
    } catch (error) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Graphic Designer</title>
    <style>
        body { margin: 0; padding: 0; font-family: system-ui; background: #0a0a0b; color: #f8fafc; }
        .container { padding: 2rem; text-align: center; }
        .btn { background: #3b82f6; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 AI Graphic Designer</h1>
        <p>Create stunning designs with AI assistance</p>
        <button class="btn" onclick="createDesign()">Start Designing</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        
        function createDesign() {
            const code = \`import React from 'react';

export default function AIComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Generated Design
        </h1>
        <p className="text-lg text-gray-600">
          Created with AI Graphic Designer
        </p>
      </div>
    </div>
  );
}\`;
            
            vscode.postMessage({
                command: 'exportCode',
                code: code,
                fileName: 'AIComponent.tsx'
            });
        }
    </script>
</body>
</html>`;
    }
}
async function exportToWorkspace(code, fileName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }
    const filePath = vscode.Uri.joinPath(workspaceFolders[0].uri, fileName);
    await vscode.workspace.fs.writeFile(filePath, Buffer.from(code, 'utf8'));
    vscode.window.showInformationMessage(`Exported ${fileName} to workspace`);
    const document = await vscode.workspace.openTextDocument(filePath);
    vscode.window.showTextDocument(document);
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map