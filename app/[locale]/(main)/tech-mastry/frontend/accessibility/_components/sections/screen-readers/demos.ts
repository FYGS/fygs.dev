export const headingStructureDemo = `
<main>
  <h1>Main Page Title</h1>
  
  <section>
    <h2>About Us</h2>
    <p>Company description goes here.</p>
    
    <h3>Our Mission</h3>
    <p>Mission statement goes here.</p>
  </section>

  <section>
    <h2>Services</h2>
    <ul>
      <li>Service 1</li>
      <li>Service 2</li>
    </ul>
  </section>
</main>
`;

export const ariaLiveDemo = `
<div role="status" aria-live="polite" id="notification">
  <!-- Content will be updated dynamically -->
</div>

<button id="notifyBtn">Show Notification</button>
`;

export const formAccessibilityDemo = `
<form>
  <div class="form-group">
    <label for="username">Username</label>
    <input 
      type="text" 
      id="username" 
      name="username" 
      aria-required="true"
      aria-describedby="username-help"
    />
    <div id="username-help" class="help-text">
      Enter your username (minimum 3 characters)
    </div>
  </div>

  <div class="form-group">
    <span id="newsletter-label">Email Preferences</span>
    <div role="group" aria-labelledby="newsletter-label">
      <input 
        type="checkbox" 
        id="newsletter" 
        name="newsletter"
      />
      <label for="newsletter">Subscribe to newsletter</label>
    </div>
  </div>

  <button type="submit">Submit</button>
</form>
`;

export const renderAriaLiveDemo = (code: string, container: HTMLDivElement) => {
  container.innerHTML = code;

  // Add event listeners after rendering HTML
  const button = container.querySelector("#notifyBtn");
  const notification = container.querySelector("#notification");

  if (button && notification) {
    button.addEventListener("click", () => {
      notification.textContent =
        "New message received at " + new Date().toLocaleTimeString();
    });
  }
};
