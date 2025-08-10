"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const axios_1 = require("axios");
const vscode = require("vscode");
class ApiService {
    constructor(authService) {
        this.authService = authService;
        const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
        const apiUrl = config.get('apiUrl') || 'https://api.ai-graphic-designer.com';
        this.client = axios_1.default.create({
            baseURL: apiUrl,
            timeout: 30000
        });
        this.client.interceptors.request.use((config) => {
            const token = this.authService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        this.client.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401) {
                await this.authService.logout();
                vscode.window.showErrorMessage('Session expired. Please login again.');
            }
            return Promise.reject(error);
        });
    }
    async generateDesigns(prompt, options) {
        if (!this.authService.isAuthenticated()) {
            const login = await vscode.window.showErrorMessage('Please login to generate designs', 'Login');
            if (login === 'Login') {
                const success = await this.authService.login();
                if (!success)
                    throw new Error('Authentication required');
            }
            else {
                throw new Error('Authentication required');
            }
        }
        try {
            const response = await this.client.post('/api/generate', {
                prompt,
                style: options?.style || 'modern',
                layout: options?.layout || 'grid',
                colorScheme: options?.colorScheme || 'blue',
                typography: options?.typography || 'clean'
            });
            return response.data.designs || [];
        }
        catch (error) {
            if (error.response?.status === 403) {
                vscode.window.showErrorMessage('Upgrade your plan to generate more designs');
            }
            throw error;
        }
    }
    async getUserDesigns() {
        if (!this.authService.isAuthenticated())
            return [];
        try {
            const response = await this.client.get('/api/designs');
            return response.data.designs || [];
        }
        catch (error) {
            console.error('Failed to fetch user designs:', error);
            return [];
        }
    }
    async saveDesign(design) {
        if (!this.authService.isAuthenticated())
            return;
        try {
            await this.client.post('/api/designs', design);
        }
        catch (error) {
            console.error('Failed to save design:', error);
        }
    }
    async exportDesign(designId, format) {
        if (!this.authService.isAuthenticated()) {
            throw new Error('Authentication required');
        }
        try {
            const response = await this.client.post(`/api/designs/${designId}/export`, {
                format
            });
            return response.data.code || '';
        }
        catch (error) {
            throw new Error(`Export failed: ${error.message}`);
        }
    }
    async getUserSubscription() {
        if (!this.authService.isAuthenticated())
            return null;
        try {
            const response = await this.client.get('/api/user/subscription');
            return response.data.subscription;
        }
        catch (error) {
            return null;
        }
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=apiService.js.map