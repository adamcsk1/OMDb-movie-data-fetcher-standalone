/* eslint-disable no-useless-escape */

const MD_TEMPLATE = `### {{Title}}
[IMDb ({{imdbID}})](https://www.imdb.com/title/{{imdbID}}/) (**{{imdbRating}}** / 10)
{{Plot}}
![poster\|90]({{Poster}})

**Year**
{{Year}}
**Director**
{{Director}}
**Genre**
{{Genre}}
**Actors**
{{Actors}}
**Trailer**
[YouTube](https://www.youtube.com/results?search_query={{YoutubeQuery}})
**Web**
[DuckDuckGo](https://duckduckgo.com/?q={{WebQuery}})
**Tags**
#{{Type}} {{Tags}}
`;

export default class MdContentGenerator {
  #omdbData = {};

  constructor(omdbData) {
    this.#omdbData = omdbData;
  }

  getMdContent() {
    let resultContent = MD_TEMPLATE;

    for (const [key, value] of Object.entries(this.#omdbData)) {
      resultContent = resultContent.replaceAll(`{{${key}}}`, value);
    }

    resultContent = resultContent.replace(
      '{{YoutubeQuery}}',
      encodeURIComponent(`${this.#omdbData.Title} ${this.#omdbData.Year} trailer`),
    );
    resultContent = resultContent.replace(
      '{{WebQuery}}',
      encodeURIComponent(`${this.#omdbData.Title} ${this.#omdbData.Year}`),
    );

    return resultContent;
  }
}
