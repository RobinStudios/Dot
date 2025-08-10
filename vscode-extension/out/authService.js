"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
class AuthService {
    constructor(context) {
        this.context = context;
    }
    async login() {
        try {
            const email = await vscode.window.showInputBox({
                prompt: 'Enter your email',
                placeHolder: 'user@example.com'
            });
            if (!email)
                return false;
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your password',
                password: true
            });
            if (!password)
                return false;
            const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
            const apiUrl = config.get('apiUrl') || 'https://api.ai-graphic-designer.com';
            const response = await axios_1.default.post(`${apiUrl}/auth/login`, {
                email,
                password
            });
            const { token, user } = response.data;
            await config.update('accessToken', token, vscode.ConfigurationTarget.Global);
            await this.context.globalState.update('user', user);
            vscode.window.showInformationMessage(`Welcome back, ${user.name}!`);
            vscode.commands.executeCommand('setContext', 'aiGraphicDesigner.authenticated', true);
            return true;
        }
        catch (error) {
            if (error.response?.status === 401) {
                const signup = await vscode.window.showErrorMessage('Invalid credentials. Would you like to sign up?', 'Sign Up', 'Cancel');
                if (signup === 'Sign Up') {
                    return this.signup();
                }
            }
            else {
                vscode.window.showErrorMessage(`Login failed: ${error.message}`);
            }
            return false;
        }
    }
    async signup() {
        try {
            const name = await vscode.window.showInputBox({
                prompt: 'Enter your full name',
                placeHolder: 'John Doe'
            });
            if (!name)
                return false;
            const email = await vscode.window.showInputBox({
                prompt: 'Enter your email',
                placeHolder: 'user@example.com'
            });
            if (!email)
                return false;
            const password = await vscode.window.showInputBox({
                prompt: 'Create a password',
                password: true
            });
            if (!password)
                return false;
            const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
            const apiUrl = config.get('apiUrl') || 'https://api.ai-graphic-designer.com';
            const response = await axios_1.default.post(`${apiUrl}/auth/signup`, {
                name,
                email,
                password
            });
            const { token, user } = response.data;
            await config.update('accessToken', token, vscode.ConfigurationTarget.Global);
            await this.context.globalState.update('user', user);
            vscode.window.showInformationMessage(`Welcome to AI Graphic Designer, ${user.name}!`);
            vscode.commands.executeCommand('setContext', 'aiGraphicDesigner.authenticated', true);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Signup failed: ${error.message}`);
            return false;
        }
    }
    async logout() {
        const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
        await config.update('accessToken', undefined, vscode.ConfigurationTarget.Global);
        await this.context.globalState.update('user', undefined);
        vscode.commands.executeCommand('setContext', 'aiGraphicDesigner.authenticated', false);
        vscode.window.showInformationMessage('Logged out successfully');
    }
    getToken() {
        const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
        return config.get('accessToken');
    }
    getUser() {
        return this.context.globalState.get('user');
    }
    isAuthenticated() {
        return !!this.getToken();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map