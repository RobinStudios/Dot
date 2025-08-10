"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const vscode = require("vscode");
class SubscriptionService {
    constructor(apiService) {
        this.apiService = apiService;
    }
    async checkSubscription() {
        try {
            const subscription = await this.apiService.getUserSubscription();
            if (!subscription || subscription.status !== 'active') {
                this.showUpgradeMessage();
                return false;
            }
            if (subscription.designsRemaining <= 0) {
                vscode.window.showWarningMessage('You have reached your design generation limit for this month.', 'Upgrade Plan').then(selection => {
                    if (selection === 'Upgrade Plan') {
                        this.openUpgradePage();
                    }
                });
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    showUpgradeMessage() {
        vscode.window.showInformationMessage('Upgrade to Pro to generate unlimited designs in VSCode!', 'Upgrade Now', 'Learn More').then(selection => {
            if (selection === 'Upgrade Now') {
                this.openUpgradePage();
            }
            else if (selection === 'Learn More') {
                vscode.env.openExternal(vscode.Uri.parse('https://ai-graphic-designer.com/pricing'));
            }
        });
    }
    openUpgradePage() {
        vscode.env.openExternal(vscode.Uri.parse('https://ai-graphic-designer.com/upgrade'));
    }
}
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscriptionService.js.map