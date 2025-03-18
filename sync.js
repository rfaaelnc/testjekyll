const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Cria a pasta _docs se não existir
if (!fs.existsSync(path.join(__dirname, '_docs'))) {
  fs.mkdirSync(path.join(__dirname, '_docs'));
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function sync() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    response.results.forEach(page => {
      const title = page.properties.Title.title[0].plain_text;
      const slug = page.properties.Slug.rich_text[0].plain_text;
      const content = page.properties.Content.rich_text[0].plain_text;
      const category = page.properties.Category.select.name;

      const frontMatter = `---
layout: page
title: ${title}
category: ${category}
---

${content}
`;

      fs.writeFileSync(
        path.join(__dirname, `_docs/${slug}.md`),
        frontMatter
      );
    });

    console.log('Sincronização concluída!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

sync();
