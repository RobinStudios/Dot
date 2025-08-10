"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignWebviewProvider = void 0;
const vscode = require("vscode");
class DesignWebviewProvider {
    constructor(_extensionUri, _apiService) {
        this._extensionUri = _extensionUri;
        this._apiService = _apiService;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'login':
                    vscode.commands.executeCommand('aiGraphicDesigner.login');
                    break;
                case 'checkAuth':
                    this.checkAuthStatus();
                    break;
                case 'generateDesign':
                    await this.generateDesign(data.prompt, data.options);
                    break;
                case 'exportDesign':
                    await this.exportDesign(data.designId);
                    break;
                case 'saveDesign':
                    await this.saveDesign(data.designId);
                    break;
            }
        });
    }
    async generateDesign(prompt, options) {
        if (!this._view)
            return;
        this._view.webview.postMessage({
            type: 'showLoading',
            message: 'Generating designs...'
        });
        try {
            const designs = await this._apiService.generateDesigns(prompt, options);
            this._currentDesign = designs[0];
            this._view.webview.postMessage({
                type: 'designGenerated',
                designs: designs
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Design generation failed: ${error}`);
            this._view.webview.postMessage({
                type: 'hideLoading'
            });
        }
    }
    getCurrentDesign() {
        return this._currentDesign;
    }
    checkAuthStatus() {
        if (!this._view)
            return;
        const user = this._apiService['authService'].getUser();
        if (user) {
            this._view.webview.postMessage({
                type: 'authenticated',
                user: user
            });
        }
        else {
            this._view.webview.postMessage({
                type: 'unauthenticated'
            });
        }
    }
    async exportDesign(designId) {
        try {
            const code = await this._apiService.exportDesign(designId, 'html');
            const doc = await vscode.workspace.openTextDocument({
                content: code,
                language: 'html'
            });
            vscode.window.showTextDocument(doc);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    async saveDesign(designId) {
        try {
            await this._apiService.saveDesign(this._currentDesign);
            vscode.window.showInformationMessage('Design saved successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Save failed: ${error.message}`);
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Graphic Designer</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 10px; color: var(--vscode-foreground); }
        .auth-section { text-align: center; padding: 20px; }
        .prompt-input { width: 100%; padding: 8px; margin: 10px 0; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
        .generate-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 10px 20px; cursor: pointer; margin: 5px; }
        .design-preview { border: 1px solid var(--vscode-panel-border); margin: 10px 0; padding: 10px; background: var(--vscode-editor-background); }
        .loading { text-align: center; padding: 20px; }
        .user-info { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 5px 10px; border-radius: 3px; margin: 10px 0; }
    </style>
</head>
<body>
    <div id="authSection" class="auth-section">
        <h2>🎨 AI Graphic Designer</h2>
        <p>Please login to start creating designs</p>
        <button id="loginBtn" class="generate-btn">Login / Sign Up</button>
    </div>

    <div id="mainSection" style="display: none;">
        <div id="userInfo" class="user-info"></div>
        
        <div class="prompt-section">
            <input type="text" id="promptInput" class="prompt-input" placeholder="Enter design prompt..." />
            <button id="generateBtn" class="generate-btn">Generate Design</button>
        </div>

        <div id="loadingDiv" class="loading" style="display: none;">
            <p>🎨 Generating designs...</p>
        </div>

        <div id="designsContainer"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('loginBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'login' });
        });
        
        document.getElementById('generateBtn').addEventListener('click', () => {
            const prompt = document.getElementById('promptInput').value;
            if (prompt) {
                vscode.postMessage({
                    type: 'generateDesign',
                    prompt: prompt,
                    options: { style: 'modern', layout: 'grid' }
                });
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'authenticated':
                    document.getElementById('authSection').style.display = 'none';
                    document.getElementById('mainSection').style.display = 'block';
                    document.getElementById('userInfo').textContent = \`Welcome, \${message.user.name}\`;
                    break;
                case 'unauthenticated':
                    document.getElementById('authSection').style.display = 'block';
                    document.getElementById('mainSection').style.display = 'none';
                    break;
                case 'showLoading':
                    document.getElementById('loadingDiv').style.display = 'block';
                    break;
                case 'hideLoading':
                    document.getElementById('loadingDiv').style.display = 'none';
                    break;
                case 'designGenerated':
                    document.getElementById('loadingDiv').style.display = 'none';
                    displayDesigns(message.designs);
                    break;
            }
        });

        function displayDesigns(designs) {
            const container = document.getElementById('designsContainer');
            container.innerHTML = '';
            
            designs.forEach((design, index) => {
                const designDiv = document.createElement('div');
                designDiv.className = 'design-preview';
                designDiv.innerHTML = \`
                    <h3>Design \${index + 1}</h3>
                    <p>Style: \${design.style || 'Modern'}</p>
                    <p>Score: \${design.overallScore || 'N/A'}</p>
                    <button onclick="exportDesign('\${design.id}')">Export to Code</button>
                    <button onclick="saveDesign('\${design.id}')">Save Design</button>
                \`;
                container.appendChild(designDiv);
            });
        }

        function exportDesign(designId) {
            vscode.postMessage({
                type: 'exportDesign',
                designId: designId
            });
        }

        function saveDesign(designId) {
            vscode.postMessage({
                type: 'saveDesign',
                designId: designId
            });
        }

        // Check auth status on load
        vscode.postMessage({ type: 'checkAuth' });
    </script>
</body>
</html>`;
    }
}
exports.DesignWebviewProvider = DesignWebviewProvider;
//# sourceMappingURL=designWebviewProvider.js.map