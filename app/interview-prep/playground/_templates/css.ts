export const cssTemplate = {
  name: "CSS",
  files: [
    {
      name: "styles.css",
      language: "css",
      content: `/* CSS Starter Template */

/* Reset some default styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Basic styling */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Header styles */
h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-size: 2.5em;
}

p {
  margin-bottom: 15px;
}

/* Card layout */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  background-color: #3498db;
  color: white;
  padding: 15px;
}

.card-body {
  padding: 20px;
}

/* Button styles */
.btn {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #2980b9;
}

/* Footer */
footer {
  margin-top: 50px;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9em;
}

/* Responsive design */
@media (max-width: 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }
  
  h1 {
    font-size: 2em;
  }
}
`
    },
    {
      name: "index.html",
      language: "html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Preview</title>
  <!-- The CSS from styles.css will be applied to this HTML -->
</head>
<body>
  <div class="container">
    <h1>CSS Starter Template</h1>
    <p>This is a preview of your CSS styles. Edit the styles.css file to see changes reflected here.</p>
    
    <div class="card-container">
      <div class="card">
        <div class="card-header">
          <h2>Card Title 1</h2>
        </div>
        <div class="card-body">
          <p>This is some sample content for the first card. You can modify the CSS to change how this card looks.</p>
          <a href="#" class="btn">Learn More</a>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Card Title 2</h2>
        </div>
        <div class="card-body">
          <p>This is some sample content for the second card. Try changing colors, spacing, or adding animations.</p>
          <a href="#" class="btn">Learn More</a>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Card Title 3</h2>
        </div>
        <div class="card-body">
          <p>This is some sample content for the third card. Experiment with different layouts and styles.</p>
          <a href="#" class="btn">Learn More</a>
        </div>
      </div>
    </div>
    
    <footer>
      <p>&copy; 2023 CSS Playground. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`
    }
  ]
};
