import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';

// 1. 定義 React 組件 (頁面模板)
function ArticlePage({ title, content }) {
  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="UTF-8" />
        <title>{title}</title>
        <style>{`
          body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
          a { color: #0070f3; text-decoration: none; }
          .back { display: inline-block; margin-top: 20px; }
        `}</style>
      </head>
      <body>
        <h1>{title}</h1>
        <p>{content}</p>
        <a href="../index.html" className="back">← 返回首頁</a>
      </body>
    </html>
  );
}

function IndexPage({ articles }) {
  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="UTF-8" />
        <title>我的極簡 SSG 部落格</title>
        <style>{`
          body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
          ul { padding: 0; list-style: none; }
          li { margin: 10px 0; font-size: 18px; }
          a { color: #0070f3; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <h1>歡迎來到我的靜態網站</h1>
        <p>以下文章皆是在 Build Time 生成的靜態 HTML 檔案：</p>
        <ul>
          {articles.map(article => (
            <li key={article.id}>
              <a href={`./posts/${article.id}.html`}>{article.title}</a>
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
}

// 2. 自動構建邏輯 (Build Process)
function build() {
  const distDir = path.resolve('./dist');
  const postsDir = path.resolve('./dist/posts');

  // 確保輸出資料夾存在
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 讀取原始資料
  const articles = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

  // 生成個別文章頁面 (e.g., dist/posts/1.html)
  articles.forEach(article => {
    const htmlString = renderToString(<ArticlePage title={article.title} content={article.content} />);
    const htmlContent = `<!DOCTYPE html>${htmlString}`;
    
    fs.writeFileSync(path.join(postsDir, `${article.id}.html`), htmlContent);
    console.log(`✅ 已生成文章頁面: /dist/posts/${article.id}.html`);
  });

  // 生成首頁 (dist/index.html)
  const indexHtmlString = renderToString(<IndexPage articles={articles} />);
  const indexContent = `<!DOCTYPE html>${indexHtmlString}`;
  
  fs.writeFileSync(path.join(distDir, 'index.html'), indexContent);
  console.log(`✅ 已生成首頁: /dist/index.html`);
  
  console.log('\n🎉 SSG 靜態網站構建完成！所有檔案皆在 /dist 資料夾中。');
}

build();
