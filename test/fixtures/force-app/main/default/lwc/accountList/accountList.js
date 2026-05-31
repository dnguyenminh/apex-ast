import { LightningElement, api, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccountList extends NavigationMixin(LightningElement) {
    @api recordId;
    @api maxRecords = 10;
    @track accounts = [];
    isLoading = true;
    error;

    @wire(getAccounts, { recordId: '$recordId', maxRecords: '$maxRecords' })
    wiredAccounts({ data, error }) {
        if (data) {
            this.accounts = data;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.isLoading = false;
        }
    }

    connectedCallback() {
        console.log('AccountList connected');
    }

    renderedCallback() {
        // Post-render logic
    }

    handleRowClick(event) {
        const accountId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId: accountId, actionName: 'view' }
        });
    }

    handleRefresh() {
        this.isLoading = true;
        this.dispatchEvent(new CustomEvent('refresh', { detail: { recordId: this.recordId } }));
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    @api
    refresh() {
        this.handleRefresh();
    }
}
