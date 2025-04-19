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
header {
  margin-bottom: 30px;
  border-bottom: 3px solid #3498db;
  padding-bottom: 20px;
  background-color: #f0f8ff;
  padding: 20px;
  border-radius: 8px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-size: 2.5em;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

h2 {
  color: #3498db;
  margin: 25px 0 15px;
  font-size: 1.8em;
}

h3 {
  font-size: 1.3em;
  margin-bottom: 10px;
}

p {
  margin-bottom: 15px;
}

/* Section styling */
section {
  margin: 20px 0;
}

.content {
  padding: 20px 0;
}

/* Card layout */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e1e1e1;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.card-header {
  background-color: #3498db;
  color: white;
  padding: 15px;
  border-bottom: 2px solid #2980b9;
}

.card-body {
  padding: 20px;
  background-color: #f9f9f9;
}

/* Form styles */
.form-section {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin: 30px 0;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
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
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn:hover {
  background-color: #2980b9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

/* Footer */
footer {
  margin-top: 50px;
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9em;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Responsive design */
@media (max-width: 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 2em;
  }

  .container {
    padding: 15px;
  }

  .form-section {
    padding: 15px;
  }
}
`,
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
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>CSS Starter Template</h1>
      <p>This is a preview of your CSS styles. Edit the styles.css file to see changes reflected here.</p>
    </header>

    <section class="content">
      <h2>Style Examples</h2>

      <div class="card-container">
        <div class="card">
          <div class="card-header">
            <h3>Card Title 1</h3>
          </div>
          <div class="card-body">
            <p>This is some sample content for the first card. You can modify the CSS to change how this card looks.</p>
            <a href="#" class="btn">Learn More</a>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Card Title 2</h3>
          </div>
          <div class="card-body">
            <p>This is some sample content for the second card. Try changing colors, spacing, or adding animations.</p>
            <a href="#" class="btn">Learn More</a>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Card Title 3</h3>
          </div>
          <div class="card-body">
            <p>This is some sample content for the third card. Experiment with different layouts and styles.</p>
            <a href="#" class="btn">Learn More</a>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Form Elements</h2>
        <form>
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" placeholder="Enter your name">
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" placeholder="Enter your email">
          </div>
          <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" placeholder="Enter your message"></textarea>
          </div>
          <button type="submit" class="btn">Submit</button>
        </form>
      </div>
    </section>

    <footer>
      <p>&copy; 2023 CSS Playground. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`,
    },
  ],
};
