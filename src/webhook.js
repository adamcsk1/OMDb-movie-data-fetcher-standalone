export default class Webhook {
  #webhookConfig = {};

  constructor(webhookConfig) {
    this.#webhookConfig = webhookConfig;
  }

  async send(mdContent) {
    console.log(
      this.#webhookConfig.webhookBody
        .replaceAll('{{MD_CONTENT}}', mdContent)
        .replaceAll('{{MD_DATE}}', new Date().toISOString())
        .replaceAll('\\n', ''),
    );
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) resolve(xhr.response);
        else if (xhr.readyState == 4) reject(`Error: ${xhr.statusText || 'Unknown error'}`);
      };
      xhr.onerror = () => reject('Unknown error');

      xhr.open('POST', this.#webhookConfig.webhookUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.setRequestHeader('Authorization', this.#webhookConfig.webhookAuthorization);

      const encodedMdContent = JSON.stringify(mdContent);
      xhr.send(
        this.#webhookConfig.webhookBody
          .replaceAll('{{MD_CONTENT}}', encodedMdContent.substring(1, encodedMdContent.length - 1))
          .replaceAll('{{MD_DATE}}', new Date().toISOString()),
      );
    });
  }
}
