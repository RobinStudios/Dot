import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('aiDesigner.open', () => {
        const panel = vscode.window.createWebviewPanel(
            'aiDesigner',
            'AI Graphic Designer',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent(context.extensionUri);

        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'exportCode':
                        exportToWorkspace(message.code, message.fileName);
                        break;
                    case 'showError':
                        vscode.window.showErrorMessage(message.message);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(extensionUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Graphic Designer</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <style>
        body { margin: 0; padding: 0; font-family: system-ui; background: #0a0a0b; color: #f8fafc; }
        .container { padding: 2rem; text-align: center; }
        .btn { background: #3b82f6; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #2563eb; }
        .login-form { max-width: 400px; margin: 2rem auto; padding: 2rem; background: #1e293b; border-radius: 12px; }
        .input { width: 100%; padding: 0.75rem; margin: 0.5rem 0; background: #334155; border: 1px solid #475569; border-radius: 6px; color: #f8fafc; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 AI Graphic Designer</h1>
        <div id="loginForm" class="login-form">
            <h3>Login to Continue</h3>
            <input type="email" id="email" class="input" placeholder="Email" />
            <input type="password" id="password" class="input" placeholder="Password" />
            <button class="btn" onclick="login()">Login</button>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 1rem;">
                Uses secure backend API - no credentials stored locally
            </p>
        </div>
        <div id="designPanel" class="hidden">
            <p>Create stunning designs with AI assistance</p>
            <button class="btn" onclick="createDesign()">Start Designing</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        let authToken = null;
        
        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                vscode.postMessage({ command: 'showError', message: 'Please enter email and password' });
                return;
            }
            
            try {
                // Call secure backend API
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    authToken = data.token;
                    document.getElementById('loginForm').classList.add('hidden');
                    document.getElementById('designPanel').classList.remove('hidden');
                } else {
                    vscode.postMessage({ command: 'showError', message: 'Login failed' });
                }
            } catch (error) {
                vscode.postMessage({ command: 'showError', message: 'Connection failed - ensure app is running on localhost:3000' });
            }
        }
        
        function createDesign() {
            if (!authToken) {
                vscode.postMessage({ command: 'showError', message: 'Please login first' });
                return;
            }
            
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

async function exportToWorkspace(code: string, fileName: string) {
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

export function deactivate() {}