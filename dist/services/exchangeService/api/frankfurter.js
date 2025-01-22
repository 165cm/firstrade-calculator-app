export class FrankfurterAPI {
    BASE_URL = 'https://api.frankfurter.app';
    async fetchRate(date) {
        const response = await fetch(`${this.BASE_URL}/${date}?from=USD&to=JPY`);
        const data = await response.json();
        return data.rates.JPY;
    }
    async fetchRateRange(startDate, endDate) {
        const response = await fetch(`${this.BASE_URL}/${startDate}..${endDate}?from=USD&to=JPY`);
        const data = await response.json();
        return data.rates;
    }
    getSource() {
        return 'Frankfurter';
    }
}
