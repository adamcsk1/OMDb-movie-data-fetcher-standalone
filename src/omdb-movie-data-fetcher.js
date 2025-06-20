export default class OMDbMovieDataFetcher {
  #OMDbApi = 'https://www.omdbapi.com/';
  #omdbApiKey = '';
  #searchText = '';
  #movieIMDbId = '';

  setOMDbApiKey(omdbApiKey) {
    this.#omdbApiKey = omdbApiKey;
  }

  async getMatchedContents(searchText) {
    this.#searchText = searchText;

    this.#validateSearchText();
    this.#setIMDbId();
    await this.#fetchOMDbData();
  }

  async getSelectedContent() {
    this.#validateIMDbId();
    const content = await this.#getByIMDBbId();
    return content;
  }

  #setIMDbId() {
    this.#movieIMDbId = /tt\d+/.exec(this.#searchText)?.[0] || null;
  }

  #validateSearchText() {
    if (!this.#searchText) throw new Error('The input is empty!');
  }

  #validateIMDbId() {
    if (!this.#movieIMDbId) throw new Error("We couldn't find the requested content!");
  }

  async #fetchOMDbData() {
    const elementSelectedMovie = document.getElementById('selected-movie');

    if (this.#movieIMDbId) {
      elementSelectedMovie.innerHTML = `<option value="${this.#movieIMDbId}">IMDb id: ${this.#movieIMDbId}</option>`;
    } else {
      const queryResults = await this.#getByText();

      if (queryResults.length) {
        elementSelectedMovie.innerHTML = queryResults.map(
          (result) => `<option value="${result.imdbID}">(${result.Type}) ${result.Title} (${result.Year})</option>`,
        );

        this.#movieIMDbId = queryResults[0].imdbID;

        elementSelectedMovie.addEventListener('change', (event) => {
          this.#movieIMDbId = event.target.value;
        });
      }
    }
  }

  async #getByIMDBbId() {
    const response = await this.#getOMDbData({ i: this.#movieIMDbId });
    if (!response) throw new Error('Empty OMDb response!');
    return response;
  }

  async #getByText() {
    const response = await this.#getOMDbData({ s: this.#searchText });
    if (!response.Search?.length) new Error('Empty OMDb response!');
    return response.Search;
  }

  async #getOMDbData(queryParams = {}) {
    const url = new URL(this.#OMDbApi);

    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
    url.searchParams.append('apikey', this.#omdbApiKey);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) resolve(JSON.parse(xhr.response));
        else if (xhr.readyState == 4) reject(`Error: ${xhr.statusText || 'Unknown error'}`);
      };
      xhr.onerror = () => reject('Unknown error');

      xhr.open('GET', url.href, true);
      xhr.send();
    });
  }
}
