import MdContentGenerator from './md-content-generator.js';
import OMDbMovieDataFetcher from './omdb-movie-data-fetcher.js';
import copyToClipboard from './copy-to-clipboard.js';
import Webhook from './webhook.js';

(() => {
  const STORE_KEY = 'omdb-movie-data-fetcher-standalone-data';
  const fetcher = new OMDbMovieDataFetcher();
  let lastGeneratedMdContent = '';

  document.getElementById('search-button').addEventListener('click', async () => {
    const values = getDOMValues();
    storeConfig(values);
    await searchHandler(values);
  });

  document.getElementById('generate-button').addEventListener('click', async () => {
    const values = getDOMValues();
    storeConfig(values);
    await generationHandler(values);
  });

  document.getElementById('generate-and-send-button').addEventListener('click', async () => {
    const values = getDOMValues();
    storeConfig(values);
    await generationHandler(values);
    const elementWebhookStatus = document.getElementById('webhook-status');
    try {
      elementWebhookStatus.innerText = 'Pending';
      const webhook = new Webhook({
        webhookUrl: values.config.webhookUrl,
        webhookAuthorization: values.config.webhookAuthorization,
        webhookBody: values.config.webhookBody,
      });
      elementWebhookStatus.innerText = 'Ok';
      await webhook.send(lastGeneratedMdContent);
    } catch (error) {
      elementWebhookStatus.innerText = 'Error';
      alert(String(error));
    }
  });

  document.getElementById('copy-button').addEventListener('click', () => {
    try {
      copyToClipboard(lastGeneratedMdContent);
    } catch (error) {
      alert(String(error));
    }
  });

  const storeConfig = (values) => {
    if (values.storeConfig) localStorage.setItem(STORE_KEY, JSON.stringify(values.config));
    else localStorage.removeItem(STORE_KEY);
  };

  const loadConfig = () => {
    try {
      const storedData = JSON.parse(localStorage.getItem(STORE_KEY));
      document.getElementById('omdb-api-key').value = storedData.omdbApiKey;
      document.getElementById('webhook-url').value = storedData.webhookUrl;
      document.getElementById('webhook-authorization').value = storedData.webhookAuthorization;
      document.getElementById('webhook-body').value = storedData.webhookBody;
      document.getElementById('store-config').checked = true;
      fetcher.setOMDbApiKey(storedData.omdbApiKey);
    } catch (error) {
      console.error(error);
    }
  };

  const getDOMValues = () => ({
    storeConfig: document.getElementById('store-config').checked,
    config: {
      omdbApiKey: document.getElementById('omdb-api-key').value.trim(),
      webhookUrl: document.getElementById('webhook-url').value.trim(),
      webhookAuthorization: document.getElementById('webhook-authorization').value.trim(),
      webhookBody: document.getElementById('webhook-body').value.trim(),
    },
    data: {
      searchValue: document.getElementById('search-value').value.trim(),
      tags: document.getElementById('tags').value.trim(),
    },
  });

  const searchHandler = async (values) => {
    const elementSearchStatus = document.getElementById('search-status');
    try {
      elementSearchStatus.innerText = 'Pending';
      fetcher.setOMDbApiKey(values.config.omdbApiKey);
      await fetcher.getMatchedContents(values.data.searchValue);
      elementSearchStatus.innerText = 'Ok';
    } catch (error) {
      elementSearchStatus.innerText = 'Error';
      alert(String(error));
    }
  };

  const generationHandler = async (values) => {
    try {
      fetcher.setOMDbApiKey(values.config.omdbApiKey);
      storeConfig(values);
      const selectedContent = await fetcher.getSelectedContent();
      const generator = new MdContentGenerator({ ...selectedContent, Tags: values.data.tags });
      const mdContent = generator.getMdContent();
      document.getElementById('generated-content').value = mdContent;
      lastGeneratedMdContent = mdContent;
    } catch (error) {
      alert(String(error));
    }
  };

  loadConfig();
})();
