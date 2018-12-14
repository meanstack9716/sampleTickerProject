import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    searchText: string;
    modelChanged: Subject<string> = new Subject<string>();
    iextradingBaseApiUrl = 'https://api.iextrading.com';
    baseApiUrl = 'api';
    suggestionList = [];
    selectedSuggestionDetails: any;
    constructor(
        private http: HttpClient
    ) {
        this.modelChanged.pipe(
            debounceTime(300),
            distinctUntilChanged())
            .subscribe(model => {
                this.searchText = model;
                this.fireApi();
            });
    }

    changed(text: string) {
        this.modelChanged.next(text);
    }

    async fireApi() {
        this.suggestionList = await this.http.get(`${this.baseApiUrl}?input=${this.searchText}`).toPromise() as Array<any>;
        console.log(this.suggestionList);
    }

    selectedSuggestion(suggestion) {
        console.log(suggestion);
        this.suggestionList = [];
        this.selectedSuggestionDetails = {};
        this.selectedSuggestionDetails['stockTickerSymbol'] = suggestion['ticker'];
        const companyDetails = this.http.get(`${this.iextradingBaseApiUrl}/1.0/stock/${suggestion['ticker']}/company`).toPromise();
        const logoDetails = this.http.get(`${this.iextradingBaseApiUrl}/1.0/stock/${suggestion['ticker']}/logo`).toPromise();
        const last = 20;
        const latestNews = this.http.get(`${this.iextradingBaseApiUrl}/1.0/stock/${suggestion['ticker']}/news/last/${last}`).toPromise();
        Promise.all([companyDetails, logoDetails, latestNews]).then((result) => {
            this.selectedSuggestionDetails['companyName'] = result[0]['companyName'];
            this.selectedSuggestionDetails['companyIndustry'] = result[0]['industry'];
            this.selectedSuggestionDetails['sector'] = result[0]['sector'];
            this.selectedSuggestionDetails['logo'] = result[1]['url'];
            this.selectedSuggestionDetails['latestNews'] = result[2];
        }).catch((err) => {
            console.log(err);
        });
    }
}
