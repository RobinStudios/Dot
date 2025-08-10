"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockupGalleryProvider = void 0;
const vscode = require("vscode");
class MockupGalleryProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.mockups = [];
        this.loadMockups();
    }
    refresh() {
        this.loadMockups();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.mockups);
        }
        return Promise.resolve([]);
    }
    loadMockups() {
        // In a real implementation, load from storage
        this.mockups = [
            new MockupItem('Recent Designs', vscode.TreeItemCollapsibleState.Expanded, 'folder'),
            new MockupItem('Modern Landing Page', vscode.TreeItemCollapsibleState.None, 'design'),
            new MockupItem('Business Card', vscode.TreeItemCollapsibleState.None, 'design'),
            new MockupItem('Social Media Post', vscode.TreeItemCollapsibleState.None, 'design'),
        ];
    }
    addMockup(title) {
        this.mockups.push(new MockupItem(title, vscode.TreeItemCollapsibleState.None, 'design'));
        this.refresh();
    }
}
exports.MockupGalleryProvider = MockupGalleryProvider;
class MockupItem extends vscode.TreeItem {
    constructor(label, collapsibleState, type) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.type = type;
        this.tooltip = `${this.label}`;
        this.contextValue = type;
        if (type === 'design') {
            this.command = {
                command: 'aiGraphicDesigner.openDesign',
                title: 'Open Design',
                arguments: [this]
            };
            this.iconPath = new vscode.ThemeIcon('file-media');
        }
        else {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}
//# sourceMappingURL=mockupGalleryProvider.js.map