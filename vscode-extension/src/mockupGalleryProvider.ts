import * as vscode from 'vscode';

export class MockupGalleryProvider implements vscode.TreeDataProvider<MockupItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MockupItem | undefined | null | void> = new vscode.EventEmitter<MockupItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MockupItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private mockups: MockupItem[] = [];

    constructor() {
        this.loadMockups();
    }

    refresh(): void {
        this.loadMockups();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MockupItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MockupItem): Thenable<MockupItem[]> {
        if (!element) {
            return Promise.resolve(this.mockups);
        }
        return Promise.resolve([]);
    }

    private loadMockups() {
        // In a real implementation, load from storage
        this.mockups = [
            new MockupItem('Recent Designs', vscode.TreeItemCollapsibleState.Expanded, 'folder'),
            new MockupItem('Modern Landing Page', vscode.TreeItemCollapsibleState.None, 'design'),
            new MockupItem('Business Card', vscode.TreeItemCollapsibleState.None, 'design'),
            new MockupItem('Social Media Post', vscode.TreeItemCollapsibleState.None, 'design'),
        ];
    }

    public addMockup(title: string) {
        this.mockups.push(new MockupItem(title, vscode.TreeItemCollapsibleState.None, 'design'));
        this.refresh();
    }
}

class MockupItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'folder' | 'design'
    ) {
        super(label, collapsibleState);
        
        this.tooltip = `${this.label}`;
        this.contextValue = type;
        
        if (type === 'design') {
            this.command = {
                command: 'aiGraphicDesigner.openDesign',
                title: 'Open Design',
                arguments: [this]
            };
            this.iconPath = new vscode.ThemeIcon('file-media');
        } else {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}