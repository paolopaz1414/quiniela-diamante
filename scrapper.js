const axios = require('axios');
const cheerio = require('cheerio');

async function fetchMatchesFromSofascore() {
  try {
    const response = await axios.get('https://www.sofascore.com/es/futbol');
    const $ = cheerio.load(response.data);

    const matches = [];

    $('a[href*="/partido/"]').each((i, el) => {
      const matchText = $(el).text().trim();
      const href = $(el).attr('href');

      const regex = /(.+?) vs (.+)/i;
      const match = matchText.match(regex);
      if (match) {
        const local = match[1].trim();
        const visitante = match[2].trim();
        matches.push({ local, visitante, href });
      }
    });

    return matches;
  } catch (error) {
    console.error('Error al hacer scraping de SofaScore:', error.message);
    return [];
  }
}

module.exports = { fetchMatchesFromSofascore };
