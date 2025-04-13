export const htmlTemplate = {
  name: "HTML",
  files: [
    {
      name: "index.html",
      language: "html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Starter Template</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background-color: #f4f4f4;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .card {
      flex: 1 1 200px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    footer {
      margin-top: 30px;
      text-align: center;
      color: #777;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <header>
    <h1>HTML Starter Template</h1>
    <p>A simple HTML template to get you started</p>
  </header>
  
  <main>
    <h2>Welcome to the HTML Playground</h2>
    <p>This is a starter template for your HTML projects. Feel free to modify it as needed.</p>
    
    <div class="container">
      <div class="card">
        <h3>HTML5 Features</h3>
        <p>HTML5 includes many new elements and attributes that reflect typical usage on modern websites.</p>
      </div>
      <div class="card">
        <h3>CSS Styling</h3>
        <p>Use CSS to control the layout and appearance of your web pages.</p>
      </div>
      <div class="card">
        <h3>JavaScript</h3>
        <p>Add interactivity to your pages with JavaScript.</p>
      </div>
    </div>
  </main>
  
  <footer>
    <p>&copy; 2023 HTML Playground. All rights reserved.</p>
  </footer>

  <script>
    // You can add JavaScript here
    console.log("HTML template loaded successfully!");
    
    // Add a click event to all cards
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', function() {
        this.style.backgroundColor = '#f0f0f0';
        console.log('Card clicked:', this.querySelector('h3').textContent);
      });
    });
  </script>
</body>
</html>`
    }
  ]
};
